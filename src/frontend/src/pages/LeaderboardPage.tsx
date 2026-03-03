import { Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { getPlayers, getTournaments } from "../utils/seedData";
import type { Player, Tournament } from "../utils/seedData";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<"All" | "Free Fire" | "PUBG">("All");

  useEffect(() => {
    setPlayers(getPlayers());
    setTournaments(getTournaments());
  }, []);

  const approvedPlayers = players.filter((p) => p.status === "approved");
  const filtered =
    filter === "All"
      ? approvedPlayers
      : approvedPlayers.filter((p) => p.game === filter);

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 107, 0, 0.06), rgba(114, 9, 183, 0.06))",
          borderBottom: "1px solid #2a2a3a",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url("/assets/generated/hero-banner.dim_1920x600.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10, 10, 15, 0.85)" }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8" style={{ color: "#ffd700" }} />
            <h1
              className="section-heading text-3xl sm:text-4xl md:text-5xl"
              style={{ color: "#f0f0f8" }}
            >
              Leader
              <span className="neon-text-orange neon-text-orange-boundary">
                board
              </span>
            </h1>
            <Trophy className="w-8 h-8" style={{ color: "#ffd700" }} />
          </div>
          <p
            className="font-rajdhani text-base text-boundary"
            style={{ color: "#b8b8d0" }}
          >
            Top approved players across all tournaments
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Filter */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(["All", "Free Fire", "PUBG"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-xs font-orbitron font-600 tracking-wider transition-all duration-300"
              style={{
                background:
                  filter === f
                    ? f === "Free Fire"
                      ? "linear-gradient(135deg, #ff6b00, #e63946)"
                      : f === "PUBG"
                        ? "linear-gradient(135deg, #e63946, #7209b7)"
                        : "linear-gradient(135deg, #ff6b00, #7209b7)"
                    : "#12121a",
                border: filter === f ? "none" : "1px solid #2a2a3a",
                color: filter === f ? "white" : "#6b6b88",
                boxShadow:
                  filter === f ? "0 0 15px rgba(255, 107, 0, 0.3)" : "none",
              }}
            >
              {f === "Free Fire" ? "🔥 " : f === "PUBG" ? "🪖 " : "⚡ "}
              {f}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-3">
            {/* Top 3 podium */}
            {filtered.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[filtered[1], filtered[0], filtered[2]].map(
                  (player, podiumIdx) => {
                    if (!player) return null;
                    const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                    const heights = ["h-28", "h-36", "h-24"];
                    const colors = ["#c0c0c0", "#ffd700", "#cd7f32"];
                    const t = tournaments.find(
                      (x) => x.id === player.tournamentId,
                    );
                    return (
                      <div
                        key={player.id}
                        className={`flex flex-col items-center justify-end ${heights[podiumIdx]}`}
                      >
                        <div className="text-2xl mb-1">
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                        </div>
                        <div
                          className="w-full rounded-t-xl p-3 text-center"
                          style={{
                            background: `linear-gradient(135deg, ${colors[podiumIdx]}15, ${colors[podiumIdx]}08)`,
                            border: `1px solid ${colors[podiumIdx]}40`,
                            borderBottom: "none",
                          }}
                        >
                          <div
                            className="font-orbitron font-700 text-xs mb-1"
                            style={{ color: colors[podiumIdx] }}
                          >
                            #{rank}
                          </div>
                          <div
                            className="font-rajdhani font-600 text-sm truncate text-boundary"
                            style={{ color: "#f0f0f8" }}
                          >
                            {player.fullName}
                          </div>
                          <div
                            className="text-xs truncate text-boundary"
                            style={{ color: "#b0b0c8" }}
                          >
                            {player.teamName || t?.game || player.game}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            {/* Full Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
            >
              <table className="gaming-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Game</th>
                    <th>Team</th>
                    <th>Tournament</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((player, index) => {
                    const rank = index + 1;
                    const t = tournaments.find(
                      (x) => x.id === player.tournamentId,
                    );
                    return (
                      <tr key={player.id}>
                        <td>
                          <div
                            className={`rank-badge ${rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-other"}`}
                          >
                            {rank <= 3
                              ? rank === 1
                                ? "🥇"
                                : rank === 2
                                  ? "🥈"
                                  : "🥉"
                              : rank}
                          </div>
                        </td>
                        <td>
                          <div
                            className="font-600 text-boundary"
                            style={{ color: "#f0f0f8" }}
                          >
                            {player.fullName}
                          </div>
                          <div
                            className="text-xs text-boundary"
                            style={{ color: "#b0b0c8" }}
                          >
                            @{player.username}
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              player.game === "Free Fire"
                                ? "badge-ff"
                                : "badge-pubg"
                            }
                          >
                            {player.game === "Free Fire" ? "🔥 FF" : "🪖 PUBG"}
                          </span>
                        </td>
                        <td
                          className="text-boundary"
                          style={{ color: "#c0c0d8" }}
                        >
                          {player.teamName || "—"}
                        </td>
                        <td
                          className="text-boundary"
                          style={{ color: "#c0c0d8" }}
                        >
                          {t?.name || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-xl"
            style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
          >
            <Medal
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "#2a2a3a" }}
            />
            <h3
              className="font-orbitron font-700 text-lg mb-2 text-boundary"
              style={{ color: "#f0f0f8" }}
            >
              No Players Yet
            </h3>
            <p
              className="font-rajdhani text-sm text-boundary"
              style={{ color: "#b0b0c8" }}
            >
              {approvedPlayers.length === 0
                ? "No approved players yet. Register and get approved to appear here!"
                : `No approved ${filter} players yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
