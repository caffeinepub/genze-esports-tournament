import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  createTournamentInBackend,
  deleteTournamentFromBackend,
  fetchTournamentsFromBackend,
} from "../utils/backendService";
import type { FrontendTournament } from "../utils/backendService";
import {
  getPayments,
  getPlayers,
  savePayments,
  savePlayers,
} from "../utils/seedData";
import type { Payment, Player } from "../utils/seedData";

type AdminTab = "dashboard" | "tournaments" | "players" | "payments";

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [tournaments, setTournaments] = useState<FrontendTournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFetchingTournaments, setIsFetchingTournaments] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  // New tournament form
  const [newTournament, setNewTournament] = useState({
    name: "",
    game: "Free Fire" as "Free Fire" | "PUBG",
    entryFee: "",
    prizePool: "",
    date: "",
    time: "",
    maxSlots: "",
    rules: "",
  });
  const [tournamentError, setTournamentError] = useState("");
  const [tournamentSuccess, setTournamentSuccess] = useState("");

  // Screenshot modal
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  const UPI_ID = "7087568640@fam";

  // ─── Load tournaments from backend ─────────────────────────────────────────
  const loadTournaments = useCallback(async () => {
    if (!actor) return;
    setIsFetchingTournaments(true);
    setBackendError(null);
    try {
      const fetched = await fetchTournamentsFromBackend(actor);
      setTournaments(fetched);
    } catch (err) {
      console.error("Failed to fetch tournaments from backend:", err);
      setBackendError(
        "Could not load tournaments from blockchain. Please refresh.",
      );
    } finally {
      setIsFetchingTournaments(false);
    }
  }, [actor]);

  // Load players/payments from localStorage
  useEffect(() => {
    setPlayers(getPlayers());
    setPayments(getPayments());
  }, []);

  useEffect(() => {
    if (actor) {
      loadTournaments();
    }
  }, [actor, loadTournaments]);

  // Poll tournaments every 10 seconds while on tournament/dashboard tab
  useEffect(() => {
    if (!actor) return;
    const interval = setInterval(() => {
      loadTournaments();
    }, 10000);
    return () => clearInterval(interval);
  }, [actor, loadTournaments]);

  const handleLogout = () => {
    localStorage.removeItem("genze_admin_session");
    localStorage.removeItem("genze_admin_token");
    navigate({ to: "/admin/login" });
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setTournamentError("");
    setTournamentSuccess("");

    if (
      !newTournament.name ||
      !newTournament.entryFee ||
      !newTournament.prizePool ||
      !newTournament.date ||
      !newTournament.time ||
      !newTournament.maxSlots
    ) {
      setTournamentError("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem("genze_admin_token") || "";

    if (!actor) {
      setTournamentError("Backend not ready. Please wait and try again.");
      return;
    }

    if (!token) {
      setTournamentError(
        "Admin session expired. Please log out and log in again.",
      );
      return;
    }

    setIsCreating(true);
    try {
      await createTournamentInBackend(actor, token, {
        name: newTournament.name,
        game: newTournament.game,
        entryFee: Number.parseInt(newTournament.entryFee),
        prizePool: Number.parseInt(newTournament.prizePool),
        date: newTournament.date,
        time: newTournament.time,
        maxSlots: Number.parseInt(newTournament.maxSlots),
        rules: newTournament.rules,
      });

      // Refresh list from backend so all devices see it
      await loadTournaments();

      setTournamentSuccess(
        `Tournament "${newTournament.name}" created successfully! It is now visible to all players in real time.`,
      );
      setNewTournament({
        name: "",
        game: "Free Fire",
        entryFee: "",
        prizePool: "",
        date: "",
        time: "",
        maxSlots: "",
        rules: "",
      });
    } catch (err) {
      console.error("Failed to create tournament:", err);
      setTournamentError(
        "Failed to create tournament. Please check your admin token and try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTournament = async (t: FrontendTournament) => {
    const token = localStorage.getItem("genze_admin_token") || "";

    if (!actor) {
      alert("Backend not ready. Please wait.");
      return;
    }
    if (!token) {
      alert("Admin session expired. Please log out and log in again.");
      return;
    }

    setIsDeleting(t.id);
    try {
      await deleteTournamentFromBackend(actor, token, t.backendId);
      await loadTournaments();
    } catch (err) {
      console.error("Failed to delete tournament:", err);
      alert("Failed to delete tournament. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePlayerAction = (
    playerId: string,
    action: "approve" | "reject",
  ) => {
    const all = getPlayers();
    const idx = all.findIndex((p) => p.id === playerId);
    if (idx === -1) return;
    all[idx].status = action === "approve" ? "approved" : "rejected";
    savePlayers(all);
    setPlayers([...all]);
  };

  const handlePaymentAction = (
    paymentId: string,
    action: "approve" | "reject",
  ) => {
    const all = getPayments();
    const idx = all.findIndex((p) => p.id === paymentId);
    if (idx === -1) return;
    all[idx].status = action === "approve" ? "approved" : "rejected";

    if (action === "approve") {
      const payment = all[idx];
      const allPlayers = getPlayers();
      const pIdx = allPlayers.findIndex((p) => p.id === payment.playerId);
      if (pIdx !== -1) {
        allPlayers[pIdx].status = "approved";
        savePlayers(allPlayers);
        setPlayers([...allPlayers]);
      }
    }

    savePayments(all);
    setPayments([...all]);
  };

  const getTournamentName = (tournamentId: string): string => {
    const t = tournaments.find(
      (t) =>
        t.id === tournamentId || `canister-${t.backendId}` === tournamentId,
    );
    return t ? t.name : tournamentId;
  };

  const pendingPlayers = players.filter((p) => p.status === "pending");
  const pendingPayments = payments.filter((p) => p.status === "pending");

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "tournaments",
      label: "Tournaments",
      icon: <Trophy className="w-4 h-4" />,
    },
    { id: "players", label: "Players", icon: <Users className="w-4 h-4" /> },
    {
      id: "payments",
      label: "Payments",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <div
      style={{
        background: "#0a0a0f",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 py-4"
        style={{ background: "#12121a", borderBottom: "1px solid #2a2a3a" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/genze-logo.dim_256x256.png"
            alt="GenZe"
            className="w-8 h-8 rounded-lg"
          />
          <div>
            <div
              className="font-orbitron font-700 text-sm"
              style={{ color: "#e8e8f0" }}
            >
              GenZe Admin
            </div>
            <div
              className="font-rajdhani text-xs flex items-center gap-1.5"
              style={{ color: "#6b6b88" }}
            >
              Control Panel
              {actorLoading ? (
                <span
                  className="flex items-center gap-1"
                  style={{ color: "#eab308" }}
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  connecting…
                </span>
              ) : actor ? (
                <span
                  className="flex items-center gap-1"
                  style={{ color: "#22c55e" }}
                >
                  <Wifi className="w-3 h-3" />
                  live
                </span>
              ) : (
                <span
                  className="flex items-center gap-1"
                  style={{ color: "#ef4444" }}
                >
                  <WifiOff className="w-3 h-3" />
                  offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          data-ocid="admin.open_modal_button"
          className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: "rgba(255,107,0,0.1)",
            border: "1px solid rgba(255,107,0,0.3)",
            color: "#ff6b00",
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Settings className="w-4 h-4" />
          <ChevronDown
            className={`w-3 h-3 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <button
          type="button"
          data-ocid="admin.logout.button"
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-rajdhani font-600 transition-all"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden flex flex-col gap-1 px-4 py-3"
          style={{ background: "#12121a", borderBottom: "1px solid #2a2a3a" }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`admin.${item.id}.tab`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-rajdhani font-600 text-left transition-all"
              style={{
                background:
                  activeTab === item.id
                    ? "rgba(255, 107, 0, 0.15)"
                    : "transparent",
                color: activeTab === item.id ? "#ff6b00" : "#8b8ba8",
                border:
                  activeTab === item.id
                    ? "1px solid rgba(255,107,0,0.3)"
                    : "1px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            type="button"
            data-ocid="admin.logout.button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-rajdhani font-600 mt-1"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="hidden sm:flex flex-col w-56 py-6 px-3 gap-1"
          style={{ background: "#0d0d15", borderRight: "1px solid #2a2a3a" }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`admin.${item.id}.tab`}
              onClick={() => setActiveTab(item.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-rajdhani font-600 text-left transition-all duration-200"
              style={{
                background:
                  activeTab === item.id
                    ? "rgba(255, 107, 0, 0.15)"
                    : "transparent",
                color: activeTab === item.id ? "#ff6b00" : "#8b8ba8",
                border:
                  activeTab === item.id
                    ? "1px solid rgba(255,107,0,0.3)"
                    : "1px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
              {item.id === "players" && pendingPlayers.length > 0 && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-700"
                  style={{
                    background: "rgba(255,107,0,0.2)",
                    color: "#ff6b00",
                  }}
                >
                  {pendingPlayers.length}
                </span>
              )}
              {item.id === "payments" && pendingPayments.length > 0 && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-700"
                  style={{
                    background: "rgba(255,107,0,0.2)",
                    color: "#ff6b00",
                  }}
                >
                  {pendingPayments.length}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Backend connection banner */}
          {actorLoading && (
            <div
              data-ocid="admin.loading_state"
              className="flex items-center gap-3 p-3 rounded-xl mb-4"
              style={{
                background: "rgba(234,179,8,0.08)",
                border: "1px solid rgba(234,179,8,0.25)",
              }}
            >
              <Loader2
                className="w-4 h-4 animate-spin flex-shrink-0"
                style={{ color: "#eab308" }}
              />
              <p className="font-rajdhani text-sm" style={{ color: "#eab308" }}>
                Connecting to the ICP blockchain — please wait a moment before
                creating tournaments…
              </p>
            </div>
          )}

          {backendError && (
            <div
              data-ocid="admin.error_state"
              className="flex items-center justify-between gap-3 p-3 rounded-xl mb-4"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <p className="font-rajdhani text-sm" style={{ color: "#ef4444" }}>
                {backendError}
              </p>
              <button
                type="button"
                onClick={loadTournaments}
                className="flex items-center gap-1 text-xs font-rajdhani font-600 px-3 py-1 rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {activeTab === "dashboard" && (
            <div>
              <h2
                className="font-orbitron font-700 text-xl mb-6"
                style={{ color: "#e8e8f0" }}
              >
                Dashboard
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Total Tournaments",
                    value: isFetchingTournaments ? "…" : tournaments.length,
                    icon: <Trophy className="w-5 h-5" />,
                    color: "#ff6b00",
                  },
                  {
                    label: "Total Players",
                    value: players.length,
                    icon: <Users className="w-5 h-5" />,
                    color: "#7209b7",
                  },
                  {
                    label: "Pending Approvals",
                    value: pendingPlayers.length + pendingPayments.length,
                    icon: <Clock className="w-5 h-5" />,
                    color: "#eab308",
                  },
                  {
                    label: "Total Revenue",
                    value: `₹${payments.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0)}`,
                    icon: <DollarSign className="w-5 h-5" />,
                    color: "#22c55e",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 mb-2"
                      style={{ color: stat.color }}
                    >
                      {stat.icon}
                      <span
                        className="font-rajdhani text-xs"
                        style={{ color: "#6b6b88" }}
                      >
                        {stat.label}
                      </span>
                    </div>
                    <div
                      className="font-orbitron font-700 text-2xl"
                      style={{ color: "#e8e8f0" }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
                >
                  <h3
                    className="font-orbitron font-600 text-sm mb-3"
                    style={{ color: "#e8e8f0" }}
                  >
                    Recent Players
                  </h3>
                  {players
                    .slice(-5)
                    .reverse()
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: "1px solid #1a1a2a" }}
                      >
                        <div>
                          <div
                            className="font-rajdhani font-600 text-sm"
                            style={{ color: "#e8e8f0" }}
                          >
                            {p.fullName}
                          </div>
                          <div
                            className="font-rajdhani text-xs"
                            style={{ color: "#6b6b88" }}
                          >
                            {p.game}
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                          style={{
                            background:
                              p.status === "approved"
                                ? "rgba(34,197,94,0.15)"
                                : p.status === "rejected"
                                  ? "rgba(239,68,68,0.15)"
                                  : "rgba(234,179,8,0.15)",
                            color:
                              p.status === "approved"
                                ? "#22c55e"
                                : p.status === "rejected"
                                  ? "#ef4444"
                                  : "#eab308",
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  {players.length === 0 && (
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#6b6b88" }}
                    >
                      No players yet.
                    </p>
                  )}
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
                >
                  <h3
                    className="font-orbitron font-600 text-sm mb-3"
                    style={{ color: "#e8e8f0" }}
                  >
                    Recent Payments
                  </h3>
                  {payments
                    .slice(-5)
                    .reverse()
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: "1px solid #1a1a2a" }}
                      >
                        <div>
                          <div
                            className="font-rajdhani font-600 text-sm"
                            style={{ color: "#e8e8f0" }}
                          >
                            {p.playerName}
                          </div>
                          <div
                            className="font-rajdhani text-xs"
                            style={{ color: "#6b6b88" }}
                          >
                            ₹{p.amount}
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                          style={{
                            background:
                              p.status === "approved"
                                ? "rgba(34,197,94,0.15)"
                                : p.status === "rejected"
                                  ? "rgba(239,68,68,0.15)"
                                  : "rgba(234,179,8,0.15)",
                            color:
                              p.status === "approved"
                                ? "#22c55e"
                                : p.status === "rejected"
                                  ? "#ef4444"
                                  : "#eab308",
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  {payments.length === 0 && (
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#6b6b88" }}
                    >
                      No payments yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TOURNAMENTS ── */}
          {activeTab === "tournaments" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="font-orbitron font-700 text-xl"
                  style={{ color: "#e8e8f0" }}
                >
                  Tournament Management
                </h2>
                <div className="flex items-center gap-2">
                  {isFetchingTournaments && (
                    <span
                      data-ocid="tournament.loading_state"
                      className="flex items-center gap-1 text-xs font-rajdhani"
                      style={{ color: "#6b6b88" }}
                    >
                      <Loader2 className="w-3 h-3 animate-spin" />
                      syncing…
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={loadTournaments}
                    disabled={isFetchingTournaments || !actor}
                    className="flex items-center gap-1 text-xs font-rajdhani font-600 px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: "rgba(255,107,0,0.1)",
                      border: "1px solid rgba(255,107,0,0.3)",
                      color: isFetchingTournaments ? "#6b6b88" : "#ff6b00",
                      cursor: isFetchingTournaments ? "not-allowed" : "pointer",
                    }}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isFetchingTournaments ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Create form */}
              <div
                className="p-6 rounded-xl mb-6"
                style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
              >
                <h3
                  className="font-orbitron font-600 text-base mb-4 flex items-center gap-2"
                  style={{ color: "#e8e8f0" }}
                >
                  <Plus className="w-4 h-4" style={{ color: "#ff6b00" }} />
                  Create New Tournament
                </h3>

                {!actor && !actorLoading && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg mb-4"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <WifiOff
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#ef4444" }}
                    />
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#ef4444" }}
                    >
                      Not connected to blockchain. Tournament creation is
                      unavailable.
                    </p>
                  </div>
                )}

                <form
                  onSubmit={handleCreateTournament}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label
                      htmlFor="tn-name"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Tournament Name *
                    </label>
                    <input
                      id="tn-name"
                      data-ocid="tournament.input"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.name}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Free Fire Grand Prix"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tn-game"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Game *
                    </label>
                    <select
                      id="tn-game"
                      data-ocid="tournament.select"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.game}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          game: e.target.value as "Free Fire" | "PUBG",
                        })
                      }
                    >
                      <option value="Free Fire">Free Fire</option>
                      <option value="PUBG">PUBG</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="tn-entry-fee"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Entry Fee (₹) *
                    </label>
                    <input
                      id="tn-entry-fee"
                      type="number"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.entryFee}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          entryFee: e.target.value,
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tn-prize-pool"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Prize Pool (₹) *
                    </label>
                    <input
                      id="tn-prize-pool"
                      type="number"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.prizePool}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          prizePool: e.target.value,
                        })
                      }
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tn-date"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Date *
                    </label>
                    <input
                      id="tn-date"
                      type="date"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.date}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tn-time"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Time *
                    </label>
                    <input
                      id="tn-time"
                      type="time"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.time}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tn-max-slots"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Max Slots *
                    </label>
                    <input
                      id="tn-max-slots"
                      type="number"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      value={newTournament.maxSlots}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          maxSlots: e.target.value,
                        })
                      }
                      placeholder="50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="tn-rules"
                      className="block font-rajdhani text-xs mb-1"
                      style={{ color: "#8b8ba8" }}
                    >
                      Rules (Optional)
                    </label>
                    <textarea
                      id="tn-rules"
                      data-ocid="tournament.textarea"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani resize-none"
                      style={{
                        background: "#0d0d15",
                        border: "1px solid #2a2a3a",
                        color: "#e8e8f0",
                      }}
                      rows={3}
                      value={newTournament.rules}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          rules: e.target.value,
                        })
                      }
                      placeholder="Tournament rules and guidelines..."
                    />
                  </div>

                  {tournamentError && (
                    <div
                      data-ocid="tournament.error_state"
                      className="sm:col-span-2 p-3 rounded-lg"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                    >
                      <p
                        className="font-rajdhani text-sm"
                        style={{ color: "#ef4444" }}
                      >
                        {tournamentError}
                      </p>
                    </div>
                  )}
                  {tournamentSuccess && (
                    <div
                      data-ocid="tournament.success_state"
                      className="sm:col-span-2 p-3 rounded-lg"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                      }}
                    >
                      <p
                        className="font-rajdhani text-sm"
                        style={{ color: "#22c55e" }}
                      >
                        {tournamentSuccess}
                      </p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      data-ocid="tournament.submit_button"
                      type="submit"
                      disabled={isCreating || actorLoading || !actor}
                      className="neon-btn-orange px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
                      style={{
                        opacity: isCreating || actorLoading || !actor ? 0.6 : 1,
                      }}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating on blockchain…
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Tournament
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tournament List */}
              <div className="space-y-3">
                <h3
                  className="font-orbitron font-600 text-sm flex items-center gap-2"
                  style={{ color: "#e8e8f0" }}
                >
                  All Tournaments (
                  {isFetchingTournaments ? "…" : tournaments.length})
                  {!isFetchingTournaments && actor && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600 flex items-center gap-1"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: "#22c55e",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                      live from blockchain
                    </span>
                  )}
                </h3>

                {isFetchingTournaments && tournaments.length === 0 && (
                  <div
                    data-ocid="tournament.loading_state"
                    className="p-8 rounded-xl text-center"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <Loader2
                      className="w-6 h-6 animate-spin mx-auto mb-3"
                      style={{ color: "#ff6b00" }}
                    />
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#6b6b88" }}
                    >
                      Loading tournaments from blockchain…
                    </p>
                  </div>
                )}

                {!isFetchingTournaments && tournaments.length === 0 && (
                  <div
                    data-ocid="tournament.empty_state"
                    className="p-8 rounded-xl text-center"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#6b6b88" }}
                    >
                      No tournaments created yet. Create one above — it will
                      appear for all players instantly.
                    </p>
                  </div>
                )}

                {tournaments.map((t, idx) => (
                  <div
                    key={t.id}
                    data-ocid={`tournament.item.${idx + 1}`}
                    className="p-4 rounded-xl flex items-center justify-between gap-4"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-orbitron font-700 text-sm truncate"
                          style={{ color: "#e8e8f0" }}
                        >
                          {t.name}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600 flex-shrink-0"
                          style={{
                            background:
                              t.game === "Free Fire"
                                ? "rgba(255,107,0,0.15)"
                                : "rgba(114,9,183,0.15)",
                            color:
                              t.game === "Free Fire" ? "#ff6b00" : "#b44fe8",
                          }}
                        >
                          {t.game}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600 flex-shrink-0"
                          style={{
                            background:
                              t.status === "active"
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(107,107,136,0.15)",
                            color:
                              t.status === "active" ? "#22c55e" : "#6b6b88",
                          }}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div
                        className="font-rajdhani text-xs mt-1 flex flex-wrap gap-3"
                        style={{ color: "#6b6b88" }}
                      >
                        <span>₹{t.entryFee} entry</span>
                        <span>
                          ₹{t.prizePool.toLocaleString("en-IN")} prize
                        </span>
                        <span>
                          {t.date} at {t.time}
                        </span>
                        <span style={{ color: "#ff6b00" }}>
                          {t.slotsUsed}/{t.maxSlots} slots filled
                        </span>
                        <span style={{ color: "#4a4a60" }}>
                          ID #{t.backendId}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-ocid={`tournament.delete_button.${idx + 1}`}
                      onClick={() => handleDeleteTournament(t)}
                      disabled={isDeleting === t.id}
                      className="flex-shrink-0 p-2 rounded-lg transition-all"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: isDeleting === t.id ? "#6b6b88" : "#ef4444",
                      }}
                      title="Delete tournament"
                    >
                      {isDeleting === t.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PLAYERS ── */}
          {activeTab === "players" && (
            <div>
              <h2
                className="font-orbitron font-700 text-xl mb-6"
                style={{ color: "#e8e8f0" }}
              >
                Player Management
              </h2>
              <div className="space-y-3">
                {players.length === 0 && (
                  <div
                    data-ocid="players.empty_state"
                    className="p-8 rounded-xl text-center"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#6b6b88" }}
                    >
                      No players registered yet.
                    </p>
                  </div>
                )}
                {players.map((p, idx) => (
                  <div
                    key={p.id}
                    data-ocid={`players.item.${idx + 1}`}
                    className="p-4 rounded-xl"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="font-orbitron font-700 text-sm"
                            style={{ color: "#e8e8f0" }}
                          >
                            {p.fullName}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                            style={{
                              background:
                                p.status === "approved"
                                  ? "rgba(34,197,94,0.15)"
                                  : p.status === "rejected"
                                    ? "rgba(239,68,68,0.15)"
                                    : "rgba(234,179,8,0.15)",
                              color:
                                p.status === "approved"
                                  ? "#22c55e"
                                  : p.status === "rejected"
                                    ? "#ef4444"
                                    : "#eab308",
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div
                          className="font-rajdhani text-xs flex flex-wrap gap-3"
                          style={{ color: "#6b6b88" }}
                        >
                          <span>@{p.username}</span>
                          <span>{p.email}</span>
                          <span>{p.phone}</span>
                          <span>{p.game}</span>
                          <span>ID: {p.gameId}</span>
                          {p.teamName && <span>Team: {p.teamName}</span>}
                          <span>
                            Tournament: {getTournamentName(p.tournamentId)}
                          </span>
                        </div>
                      </div>
                      {p.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            type="button"
                            data-ocid={`players.confirm_button.${idx + 1}`}
                            onClick={() => handlePlayerAction(p.id, "approve")}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              border: "1px solid rgba(34,197,94,0.3)",
                              color: "#22c55e",
                            }}
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            data-ocid={`players.delete_button.${idx + 1}`}
                            onClick={() => handlePlayerAction(p.id, "reject")}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              color: "#ef4444",
                            }}
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {activeTab === "payments" && (
            <div>
              <h2
                className="font-orbitron font-700 text-xl mb-6"
                style={{ color: "#e8e8f0" }}
              >
                Payment Management
              </h2>

              {/* UPI Info */}
              <div
                className="p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{
                  background: "#12121a",
                  border: "1px solid rgba(255,107,0,0.3)",
                }}
              >
                <img
                  src="/assets/generated/upi-qr-code.dim_400x400.png"
                  alt="UPI QR Code"
                  className="w-20 h-20 rounded-lg object-contain"
                  style={{ background: "white", padding: "4px" }}
                />
                <div>
                  <div
                    className="font-orbitron font-700 text-sm mb-1"
                    style={{ color: "#ff6b00" }}
                  >
                    UPI Payment Details
                  </div>
                  <div
                    className="font-rajdhani text-sm"
                    style={{ color: "#e8e8f0" }}
                  >
                    UPI ID: <span style={{ color: "#ff6b00" }}>{UPI_ID}</span>
                  </div>
                  <div
                    className="font-rajdhani text-xs mt-1"
                    style={{ color: "#6b6b88" }}
                  >
                    Verify payment screenshots below before approving
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {payments.length === 0 && (
                  <div
                    data-ocid="payments.empty_state"
                    className="p-8 rounded-xl text-center"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#6b6b88" }}
                    >
                      No payments submitted yet.
                    </p>
                  </div>
                )}
                {payments.map((p, idx) => (
                  <div
                    key={p.id}
                    data-ocid={`payments.item.${idx + 1}`}
                    className="p-4 rounded-xl"
                    style={{
                      background: "#12121a",
                      border: "1px solid #2a2a3a",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="font-orbitron font-700 text-sm"
                            style={{ color: "#e8e8f0" }}
                          >
                            {p.playerName}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                            style={{
                              background:
                                p.status === "approved"
                                  ? "rgba(34,197,94,0.15)"
                                  : p.status === "rejected"
                                    ? "rgba(239,68,68,0.15)"
                                    : "rgba(234,179,8,0.15)",
                              color:
                                p.status === "approved"
                                  ? "#22c55e"
                                  : p.status === "rejected"
                                    ? "#ef4444"
                                    : "#eab308",
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div
                          className="font-rajdhani text-xs flex flex-wrap gap-3"
                          style={{ color: "#6b6b88" }}
                        >
                          <span>₹{p.amount}</span>
                          <span>{p.tournamentName}</span>
                          <span>
                            {new Date(p.submittedAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                        {p.screenshotData && (
                          <button
                            type="button"
                            data-ocid={`payments.edit_button.${idx + 1}`}
                            onClick={() => setViewScreenshot(p.screenshotData)}
                            className="mt-2 flex items-center gap-1 text-xs font-rajdhani font-600 transition-colors"
                            style={{ color: "#ff6b00" }}
                          >
                            <Eye className="w-3 h-3" />
                            View Screenshot
                          </button>
                        )}
                      </div>
                      {p.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            type="button"
                            data-ocid={`payments.confirm_button.${idx + 1}`}
                            onClick={() => handlePaymentAction(p.id, "approve")}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              border: "1px solid rgba(34,197,94,0.3)",
                              color: "#22c55e",
                            }}
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            data-ocid={`payments.delete_button.${idx + 1}`}
                            onClick={() => handlePaymentAction(p.id, "reject")}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              color: "#ef4444",
                            }}
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Screenshot Modal */}
      {viewScreenshot && (
        <div
          data-ocid="payments.modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setViewScreenshot(null)}
          onKeyDown={(e) => e.key === "Escape" && setViewScreenshot(null)}
          role="presentation"
        >
          <div
            className="relative max-w-lg w-full rounded-xl overflow-hidden"
            style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: "1px solid #2a2a3a" }}
            >
              <span
                className="font-orbitron font-600 text-sm"
                style={{ color: "#e8e8f0" }}
              >
                Payment Screenshot
              </span>
              <button
                type="button"
                data-ocid="payments.close_button"
                onClick={() => setViewScreenshot(null)}
                style={{ color: "#6b6b88" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={viewScreenshot}
                alt="Payment Screenshot"
                className="w-full rounded-lg object-contain max-h-96"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
