import { PlayerStatus } from "../backend.d";
import type { backendInterface } from "../backend.d";

// ─── Frontend Tournament type (mirrors seedData.ts Tournament) ────────────────
export interface FrontendTournament {
  id: string; // "canister-<backendId>"
  backendId: number;
  name: string;
  game: "Free Fire" | "PUBG";
  entryFee: number;
  prizePool: number;
  date: string;
  time: string;
  maxSlots: number;
  slotsUsed: number;
  rules: string;
  status: "active" | "completed" | "cancelled";
  createdAt: number;
}

// Extra fields encoded in the backend "location" field as JSON
interface LocationJSON {
  game?: string;
  entryFee?: number;
  prizePool?: number;
  time?: string;
  rules?: string;
  status?: "active" | "completed" | "cancelled";
  createdAt?: number;
}

// ─── Decode a backend Tournament into a FrontendTournament ───────────────────
function decodeBackendTournament(t: {
  id: number;
  name: string;
  date: string;
  slotsAvailable: bigint;
  slotsUsed: bigint;
  location: string;
}): FrontendTournament {
  let extra: LocationJSON = {};
  try {
    extra = JSON.parse(t.location) as LocationJSON;
  } catch {
    // fallback: location may be a plain string (old data)
  }

  return {
    id: `canister-${t.id}`,
    backendId: t.id,
    name: t.name,
    game: (extra.game === "PUBG" ? "PUBG" : "Free Fire") as
      | "Free Fire"
      | "PUBG",
    entryFee: extra.entryFee ?? 0,
    prizePool: extra.prizePool ?? 0,
    date: t.date,
    time: extra.time ?? "",
    maxSlots: Number(t.slotsAvailable),
    slotsUsed: Number(t.slotsUsed),
    rules: extra.rules ?? "",
    status: extra.status ?? "active",
    createdAt: extra.createdAt ?? Date.now(),
  };
}

// ─── Fetch all tournaments from backend canister ─────────────────────────────
export async function fetchTournamentsFromBackend(
  actor: backendInterface,
): Promise<FrontendTournament[]> {
  const raw = await actor.getTournaments();
  return raw.map(decodeBackendTournament);
}

// ─── Create a tournament in the backend canister ─────────────────────────────
export async function createTournamentInBackend(
  actor: backendInterface,
  token: string,
  data: {
    name: string;
    game: "Free Fire" | "PUBG";
    entryFee: number;
    prizePool: number;
    date: string;
    time: string;
    maxSlots: number;
    rules: string;
  },
): Promise<number> {
  const locationJSON: LocationJSON = {
    game: data.game,
    entryFee: data.entryFee,
    prizePool: data.prizePool,
    time: data.time,
    rules: data.rules,
    status: "active",
    createdAt: Date.now(),
  };

  const id = await actor.createTournament(
    token,
    data.name,
    data.date,
    JSON.stringify(locationJSON),
    BigInt(data.maxSlots),
  );
  return id;
}

// ─── Delete a tournament from the backend canister ───────────────────────────
export async function deleteTournamentFromBackend(
  actor: backendInterface,
  token: string,
  backendId: number,
): Promise<void> {
  await actor.deleteTournament(token, backendId);
}

// ─── Register a player in the backend canister ───────────────────────────────
export interface PlayerRegistrationData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  game: "Free Fire" | "PUBG";
  gameId: string;
  teamName: string;
  password: string;
}

export async function registerPlayerInBackend(
  actor: backendInterface,
  playerData: PlayerRegistrationData,
  tournamentBackendId: number,
): Promise<number> {
  const contactJSON = JSON.stringify({
    phone: playerData.phone,
    email: playerData.email,
    gameId: playerData.gameId,
    teamName: playerData.teamName,
    game: playerData.game,
    username: playerData.username,
    password: playerData.password,
  });

  const playerId = await actor.registerPlayer(
    playerData.fullName,
    contactJSON,
    tournamentBackendId,
  );
  return playerId;
}

// ─── Frontend Player type ─────────────────────────────────────────────────────
export interface FrontendPlayer {
  backendId: number;
  id: string; // "canister-player-<backendId>"
  fullName: string;
  username: string;
  email: string;
  phone: string;
  game: "Free Fire" | "PUBG";
  gameId: string;
  teamName: string;
  tournamentId: number; // backend tournament id
  status: "pending" | "approved" | "rejected";
}

// ─── Frontend Payment type ────────────────────────────────────────────────────
export interface FrontendPayment {
  backendId: number;
  id: string; // "canister-payment-<backendId>"
  playerId: number;
  playerName: string;
  tournamentId: number;
  amount: number;
  screenshotDataUrl: string; // reconstructed data URL from Uint8Array
  status: "pending" | "approved" | "rejected";
  submittedAt: number; // from timestamp bigint converted to ms
}

// ─── Decode a backend Player into a FrontendPlayer ────────────────────────────
function decodeBackendPlayer(player: {
  id: number;
  status: PlayerStatus;
  contact: string;
  name: string;
  tournamentId: number;
}): FrontendPlayer {
  let contact: {
    phone?: string;
    email?: string;
    gameId?: string;
    teamName?: string;
    game?: string;
    username?: string;
  } = {};
  try {
    contact = JSON.parse(player.contact) as typeof contact;
  } catch {
    // ignore parse errors
  }

  return {
    backendId: player.id,
    id: `canister-player-${player.id}`,
    fullName: player.name,
    username: contact.username ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    game: (contact.game === "PUBG" ? "PUBG" : "Free Fire") as
      | "Free Fire"
      | "PUBG",
    gameId: contact.gameId ?? "",
    teamName: contact.teamName ?? "",
    tournamentId: player.tournamentId,
    status: player.status as unknown as string as
      | "pending"
      | "approved"
      | "rejected",
  };
}

// ─── Decode a backend Payment into a FrontendPayment ─────────────────────────
function decodeBackendPayment(
  payment: {
    id: number;
    screenshotMime: string;
    status: PlayerStatus;
    playerId: number;
    timestamp: bigint;
    screenshotData: Uint8Array;
  },
  playerName: string,
  tournamentId: number,
  amount: number,
): FrontendPayment {
  const binary = Array.from(payment.screenshotData)
    .map((b) => String.fromCharCode(b))
    .join("");
  const base64 = btoa(binary);
  const dataUrl = `data:${payment.screenshotMime};base64,${base64}`;

  return {
    backendId: payment.id,
    id: `canister-payment-${payment.id}`,
    playerId: payment.playerId,
    playerName,
    tournamentId,
    amount,
    screenshotDataUrl: dataUrl,
    status: payment.status as unknown as string as
      | "pending"
      | "approved"
      | "rejected",
    submittedAt: Number(payment.timestamp) / 1_000_000, // nanoseconds → ms
  };
}

// ─── Fetch ALL players across all tournaments ─────────────────────────────────
export async function fetchAllPlayersFromBackend(
  actor: backendInterface,
  tournaments: FrontendTournament[],
): Promise<FrontendPlayer[]> {
  const results = await Promise.all(
    tournaments.map((t) => actor.getPlayersByTournament(t.backendId)),
  );

  const seen = new Set<number>();
  const players: FrontendPlayer[] = [];
  for (const batch of results) {
    for (const p of batch) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        players.push(decodeBackendPlayer(p));
      }
    }
  }
  return players;
}

// ─── Fetch ALL payments for all players ──────────────────────────────────────
export async function fetchAllPaymentsFromBackend(
  actor: backendInterface,
  players: FrontendPlayer[],
): Promise<FrontendPayment[]> {
  // Build a lookup map: backendPlayerId → FrontendPlayer
  const playerMap = new Map<number, FrontendPlayer>(
    players.map((p) => [p.backendId, p]),
  );

  const results = await Promise.all(
    players.map((p) => actor.getPaymentsByPlayer(p.backendId)),
  );

  const seen = new Set<number>();
  const payments: FrontendPayment[] = [];
  for (const batch of results) {
    for (const pay of batch) {
      if (!seen.has(pay.id)) {
        seen.add(pay.id);
        const player = playerMap.get(pay.playerId);
        payments.push(
          decodeBackendPayment(
            pay,
            player?.fullName ?? "Unknown",
            player?.tournamentId ?? 0,
            0, // amount looked up from tournament entryFee in the UI
          ),
        );
      }
    }
  }
  return payments;
}

// ─── Approve or reject a player ──────────────────────────────────────────────
export async function updatePlayerStatusInBackend(
  actor: backendInterface,
  token: string,
  playerId: number,
  status: "approved" | "rejected",
): Promise<void> {
  await actor.updatePlayerStatus(
    token,
    playerId,
    status === "approved" ? PlayerStatus.approved : PlayerStatus.rejected,
  );
}

// ─── Approve or reject a payment ─────────────────────────────────────────────
export async function updatePaymentStatusInBackend(
  actor: backendInterface,
  token: string,
  paymentId: number,
  status: "approved" | "rejected",
): Promise<void> {
  await actor.updatePaymentStatus(
    token,
    paymentId,
    status === "approved" ? PlayerStatus.approved : PlayerStatus.rejected,
  );
}

// ─── Submit payment screenshot to blockchain ─────────────────────────────────
export async function submitPaymentToBackend(
  actor: backendInterface,
  playerId: number,
  screenshotBase64: string, // full data URL like "data:image/jpeg;base64,..."
  screenshotMime: string,
): Promise<number> {
  // Extract base64 portion (after the comma in data URL)
  const commaIdx = screenshotBase64.indexOf(",");
  const base64Part =
    commaIdx !== -1 ? screenshotBase64.slice(commaIdx + 1) : screenshotBase64;

  const binaryStr = atob(base64Part);
  const uint8Array = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    uint8Array[i] = binaryStr.charCodeAt(i);
  }

  const paymentId = await actor.submitPayment(
    playerId,
    uint8Array,
    screenshotMime,
  );
  return paymentId;
}
