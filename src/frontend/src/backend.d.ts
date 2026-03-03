import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: number;
    status: PlayerStatus;
    contact: string;
    name: string;
    tournamentId: TournamentId;
}
export type Time = bigint;
export interface Tournament {
    id: TournamentId;
    date: string;
    slotsAvailable: bigint;
    name: string;
    slotsUsed: bigint;
    location: string;
}
export interface Payment {
    id: number;
    screenshotMime: string;
    status: PaymentStatus;
    playerId: number;
    timestamp: Time;
    screenshotData: Uint8Array;
}
export type TournamentId = number;
export enum PlayerStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    authenticateAdmin(email: string, password: string): Promise<string>;
    createTournament(token: string, name: string, date: string, location: string, slotsAvailable: bigint): Promise<TournamentId>;
    deleteTournament(token: string, id: TournamentId): Promise<void>;
    getPaymentPaymentCount(): Promise<bigint>;
    getPaymentsByPlayer(playerId: number): Promise<Array<Payment>>;
    getPlayersByTournament(tournamentId: TournamentId): Promise<Array<Player>>;
    getTournament(id: TournamentId): Promise<Tournament | null>;
    getTournaments(): Promise<Array<Tournament>>;
    registerPlayer(name: string, contact: string, tournamentId: TournamentId): Promise<number>;
    submitPayment(playerId: number, screenshotData: Uint8Array, screenshotMime: string): Promise<number>;
    updatePaymentStatus(token: string, paymentId: number, status: PaymentStatus): Promise<void>;
    updatePlayerStatus(token: string, playerId: number, status: PlayerStatus): Promise<void>;
}
