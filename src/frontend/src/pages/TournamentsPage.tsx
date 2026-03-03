import { Filter, Loader2, Wifi } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import TournamentCard from "../components/TournamentCard";
import { useActor } from "../hooks/useActor";
import { fetchTournamentsFromBackend } from "../utils/backendService";
import type { FrontendTournament } from "../utils/backendService";

// Map FrontendTournament to the shape TournamentCard expects (same as seedData Tournament)
function toCardTournament(t: FrontendTournament) {
  return {
    id: t.id,
    name: t.name,
    game: t.game,
    entryFee: t.entryFee,
    prizePool: t.prizePool,
    date: t.date,
    time: t.time,
    maxSlots: t.maxSlots,
    slotsUsed: t.slotsUsed,
    rules: t.rules,
    status: t.status,
    createdAt: t.createdAt,
  };
}

type FilterType = "All" | "Free Fire" | "PUBG";

export default function TournamentsPage() {
  const { actor, isFetching: actorLoading } = useActor();
  const [tournaments, setTournaments] = useState<FrontendTournament[]>([]);
  const [filter, setFilter] = useState<FilterType>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshTournaments = useCallback(async () => {
    if (!actor) return;
    try {
      const fetched = await fetchTournamentsFromBackend(actor);
      setTournaments(fetched);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load tournaments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  // Initial load
  useEffect(() => {
    if (actor) {
      setIsLoading(true);
      refreshTournaments();
    } else if (!actorLoading) {
      setIsLoading(false);
    }
  }, [actor, actorLoading, refreshTournaments]);

  // Poll every 5 seconds for real-time updates
  useEffect(() => {
    if (!actor) return;
    const interval = setInterval(refreshTournaments, 5000);
    return () => clearInterval(interval);
  }, [actor, refreshTournaments]);

  const filtered =
    filter === "All"
      ? tournaments
      : tournaments.filter((t) => t.game === filter);

  const visibleTournaments = filtered.filter((t) => t.status === "active");

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      {/* Page Header */}
      <div
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
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
        <div className="relative max-w-7xl mx-auto text-center">
          <h1
            className="section-heading text-3xl sm:text-4xl md:text-5xl mb-4"
            style={{ color: "#f0f0f8" }}
          >
            All{" "}
            <span className="neon-text-orange neon-text-orange-boundary">
              Tournaments
            </span>
          </h1>
          <p
            className="font-rajdhani text-base sm:text-lg text-boundary"
            style={{ color: "#b8b8d0" }}
          >
            Choose your battle and register before slots fill up
          </p>
          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {actorLoading || (isLoading && !lastUpdated) ? (
              <span
                data-ocid="tournaments.loading_state"
                className="flex items-center gap-1.5 text-xs font-rajdhani px-3 py-1 rounded-full"
                style={{
                  background: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.25)",
                  color: "#eab308",
                }}
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Connecting to blockchain…
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 text-xs font-rajdhani px-3 py-1 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#22c55e",
                }}
              >
                <Wifi className="w-3 h-3" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Live — updates every 5 seconds
                {lastUpdated && (
                  <span style={{ color: "#4a7a5a" }}>
                    &nbsp;·{" "}
                    {lastUpdated.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: "#6b6b88" }} />
            <span
              className="font-rajdhani text-sm font-600 tracking-wider uppercase text-boundary"
              style={{ color: "#b0b0c8" }}
            >
              Filter by Game:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(["All", "Free Fire", "PUBG"] as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                data-ocid="tournaments.filter.tab"
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
        </div>

        {/* Count */}
        {!isLoading && (
          <div className="mb-6">
            <span
              className="font-rajdhani text-sm text-boundary"
              style={{ color: "#b0b0c8" }}
            >
              Showing{" "}
              <span style={{ color: "#ff8c33" }}>
                {visibleTournaments.length}
              </span>{" "}
              tournament{visibleTournaments.length !== 1 ? "s" : ""}
              {filter !== "All" && ` for ${filter}`}
            </span>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div
            data-ocid="tournaments.loading_state"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{
                  background: "#12121a",
                  border: "1px solid #2a2a3a",
                  height: "280px",
                }}
              >
                <div
                  className="h-1 w-full"
                  style={{ background: "rgba(255,107,0,0.2)" }}
                />
                <div className="p-5 space-y-4">
                  <div
                    className="h-4 rounded-lg"
                    style={{ background: "#1a1a2a", width: "70%" }}
                  />
                  <div
                    className="h-3 rounded-lg"
                    style={{ background: "#1a1a2a", width: "45%" }}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div
                      className="h-12 rounded-xl"
                      style={{ background: "#1a1a2a" }}
                    />
                    <div
                      className="h-12 rounded-xl"
                      style={{ background: "#1a1a2a" }}
                    />
                  </div>
                  <div
                    className="h-8 rounded-xl mt-2"
                    style={{ background: "#1a1a2a" }}
                  />
                  <div
                    className="h-10 rounded-xl mt-2"
                    style={{ background: "rgba(255,107,0,0.08)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tournament Grid */}
        {!isLoading && visibleTournaments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={toCardTournament(tournament)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && visibleTournaments.length === 0 && (
          <div
            data-ocid="tournaments.empty_state"
            className="text-center py-20 rounded-xl"
            style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
          >
            <div className="text-5xl mb-4">🎮</div>
            <h3
              className="font-orbitron font-700 text-lg mb-2 text-boundary"
              style={{ color: "#f0f0f8" }}
            >
              No Tournaments Yet
            </h3>
            <p
              className="font-rajdhani text-sm text-boundary"
              style={{ color: "#b0b0c8", maxWidth: "320px", margin: "0 auto" }}
            >
              {filter !== "All"
                ? `No ${filter} tournaments available right now. Check back soon!`
                : "The admin hasn't created any tournaments yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
