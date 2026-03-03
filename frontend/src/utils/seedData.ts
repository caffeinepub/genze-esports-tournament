export interface Tournament {
  id: string;
  name: string;
  game: 'Free Fire' | 'PUBG';
  entryFee: number;
  prizePool: number;
  date: string;
  time: string;
  maxSlots: number;
  slotsUsed: number;
  rules: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface Player {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  game: 'Free Fire' | 'PUBG';
  gameId: string;
  teamName: string;
  tournamentId: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: number;
}

export interface Payment {
  id: string;
  playerId: string;
  playerName: string;
  tournamentId: string;
  tournamentName: string;
  amount: number;
  screenshotData: string;
  screenshotName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
}

export function seedData(): void {
  // Only initialize empty arrays if keys don't exist — no hardcoded tournaments
  if (!localStorage.getItem('genze_tournaments')) {
    localStorage.setItem('genze_tournaments', JSON.stringify([]));
  }
  if (!localStorage.getItem('genze_players')) {
    localStorage.setItem('genze_players', JSON.stringify([]));
  }
  if (!localStorage.getItem('genze_payments')) {
    localStorage.setItem('genze_payments', JSON.stringify([]));
  }
}

export function getTournaments(): Tournament[] {
  try {
    return JSON.parse(localStorage.getItem('genze_tournaments') || '[]');
  } catch {
    return [];
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  localStorage.setItem('genze_tournaments', JSON.stringify(tournaments));
}

export function getPlayers(): Player[] {
  try {
    return JSON.parse(localStorage.getItem('genze_players') || '[]');
  } catch {
    return [];
  }
}

export function savePlayers(players: Player[]): void {
  localStorage.setItem('genze_players', JSON.stringify(players));
}

export function getPayments(): Payment[] {
  try {
    return JSON.parse(localStorage.getItem('genze_payments') || '[]');
  } catch {
    return [];
  }
}

export function savePayments(payments: Payment[]): void {
  localStorage.setItem('genze_payments', JSON.stringify(payments));
}

export function incrementTournamentSlots(tournamentId: string): boolean {
  try {
    const tournaments = getTournaments();
    const index = tournaments.findIndex((t) => t.id === tournamentId);
    if (index === -1) return false;
    tournaments[index] = {
      ...tournaments[index],
      slotsUsed: tournaments[index].slotsUsed + 1,
    };
    saveTournaments(tournaments);
    return true;
  } catch {
    return false;
  }
}

export function isAdminLoggedIn(): boolean {
  try {
    const session = JSON.parse(localStorage.getItem('genze_admin_session') || 'null');
    if (!session) return false;
    // Session expires after 24 hours
    return session.isAdmin && (Date.now() - session.timestamp) < 86400000;
  } catch {
    return false;
  }
}
