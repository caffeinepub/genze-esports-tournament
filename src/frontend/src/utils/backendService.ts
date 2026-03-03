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
