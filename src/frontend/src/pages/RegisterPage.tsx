import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Gamepad2,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  fetchTournamentsFromBackend,
  registerPlayerInBackend,
} from "../utils/backendService";
import type { FrontendTournament } from "../utils/backendService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();
  // Use strict: false to avoid route ID mismatch with nested layout routes
  const search = useSearch({ strict: false }) as { tournamentId?: string };
  const tournamentId = search.tournamentId || "";

  const [tournaments, setTournaments] = useState<FrontendTournament[]>([]);
  const [selectedTournament, setSelectedTournament] =
    useState<FrontendTournament | null>(null);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    game: "" as "Free Fire" | "PUBG" | "",
    gameId: "",
    teamName: "",
    tournamentId: tournamentId,
    password: "",
    confirmPassword: "",
  });

  // Load tournaments from backend canister
  const loadTournaments = useCallback(async () => {
    if (!actor) return;
    setIsLoadingTournaments(true);
    try {
      const fetched = await fetchTournamentsFromBackend(actor);
      const active = fetched.filter((t) => t.status === "active");
      setTournaments(active);

      // If a tournamentId was passed in the URL, pre-select that tournament
      if (tournamentId) {
        const found = active.find(
          (t) =>
            t.id === tournamentId || `canister-${t.backendId}` === tournamentId,
        );
        if (found) {
          setSelectedTournament(found);
          setForm((prev) => ({
            ...prev,
            game: found.game,
            tournamentId: found.id,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load tournaments:", err);
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [actor, tournamentId]);

  useEffect(() => {
    if (actor) {
      loadTournaments();
    } else if (!actorLoading) {
      setIsLoadingTournaments(false);
    }
  }, [actor, actorLoading, loadTournaments]);

  // Update selected tournament when form.tournamentId changes
  useEffect(() => {
    if (form.tournamentId && tournaments.length > 0) {
      const found = tournaments.find((t) => t.id === form.tournamentId);
      setSelectedTournament(found || null);
      if (found) setForm((prev) => ({ ...prev, game: found.game }));
    }
  }, [form.tournamentId, tournaments]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter valid 10-digit Indian mobile number";
    if (!form.game) newErrors.game = "Please select a game";
    if (!form.gameId.trim()) newErrors.gameId = "Game ID is required";
    if (!form.tournamentId)
      newErrors.tournamentId = "Please select a tournament";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedTournament) {
      setSubmitError("Please select a valid tournament.");
      return;
    }

    setIsSubmitting(true);

    try {
      let backendPlayerId: number | null = null;

      // Register with backend canister (increments slotsUsed automatically)
      if (actor) {
        backendPlayerId = await registerPlayerInBackend(
          actor,
          {
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            phone: form.phone,
            game: form.game as "Free Fire" | "PUBG",
            gameId: form.gameId,
            teamName: form.teamName,
            password: form.password,
          },
          selectedTournament.backendId,
        );
      }

      // Build a local player ID for passing to the payment page
      const localPlayerId =
        backendPlayerId !== null
          ? `canister-player-${backendPlayerId}`
          : `player-${Date.now()}`;

      setIsSubmitting(false);
      navigate({
        to: "/payment",
        search: {
          playerId: localPlayerId,
          tournamentId: form.tournamentId,
          amount: String(selectedTournament.entryFee),
        },
      });
    } catch (err) {
      console.error("Registration failed:", err);
      setSubmitError(
        "Registration failed. The tournament may be full or there was a network error. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="py-12 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 107, 0, 0.06), rgba(114, 9, 183, 0.06))",
          borderBottom: "1px solid #2a2a3a",
        }}
      >
        <h1
          className="section-heading text-3xl sm:text-4xl mb-3"
          style={{ color: "#f0f0f8" }}
        >
          Player{" "}
          <span className="neon-text-orange neon-text-orange-boundary">
            Registration
          </span>
        </h1>
        <p
          className="font-rajdhani text-base text-boundary"
          style={{ color: "#ff8c33" }}
        >
          Fill in your details to join the tournament
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Selected Tournament Banner */}
        {selectedTournament && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 107, 0, 0.1), rgba(114, 9, 183, 0.1))",
              border: "1px solid rgba(255, 107, 0, 0.3)",
            }}
          >
            <div>
              <div
                className="font-orbitron font-700 text-sm text-boundary"
                style={{ color: "#f0f0f8" }}
              >
                {selectedTournament.name}
              </div>
              <div
                className="font-rajdhani text-xs mt-1 text-boundary"
                style={{ color: "#ff8c33" }}
              >
                {selectedTournament.game} • {selectedTournament.date} at{" "}
                {selectedTournament.time}
              </div>
            </div>
            <div className="text-right">
              <div
                className="font-orbitron font-800 text-xl"
                style={{ color: "#ff6b00" }}
              >
                ₹{selectedTournament.entryFee}
              </div>
              <div
                className="text-xs text-boundary"
                style={{ color: "#ff8c33" }}
              >
                Entry Fee
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tournament Selection */}
          <div>
            <label htmlFor="reg-tournament" className="form-label">
              Select Tournament *
            </label>
            <div className="relative">
              {isLoadingTournaments ? (
                <div
                  data-ocid="register.loading_state"
                  className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani flex items-center gap-2"
                  style={{
                    background: "#0d0d15",
                    border: "1px solid #2a2a3a",
                    color: "#9090b0",
                  }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading tournaments from blockchain…
                </div>
              ) : (
                <select
                  id="reg-tournament"
                  data-ocid="register.select"
                  className="gaming-select"
                  value={form.tournamentId}
                  onChange={(e) => handleChange("tournamentId", e.target.value)}
                >
                  <option value="">-- Select Tournament --</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — ₹{t.entryFee} Entry
                    </option>
                  ))}
                </select>
              )}
              {!isLoadingTournaments && (
                <ChevronRight
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 pointer-events-none"
                  style={{ color: "#6b6b88" }}
                />
              )}
            </div>
            {errors.tournamentId && (
              <p
                data-ocid="register.error_state"
                className="text-xs mt-1"
                style={{ color: "#e63946" }}
              >
                {errors.tournamentId}
              </p>
            )}
            {!isLoadingTournaments && tournaments.length === 0 && (
              <p className="text-xs mt-1" style={{ color: "#eab308" }}>
                No active tournaments available right now. Check back soon!
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="reg-fullname" className="form-label">
              Full Name *
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#6b6b88" }}
              />
              <input
                id="reg-fullname"
                data-ocid="register.input"
                type="text"
                className="gaming-input pl-10"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="reg-username" className="form-label">
              Username / Game ID *
            </label>
            <div className="relative">
              <Gamepad2
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#6b6b88" }}
              />
              <input
                id="reg-username"
                type="text"
                className="gaming-input pl-10"
                placeholder="Your in-game username"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
            {errors.username && (
              <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                {errors.username}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-email" className="form-label">
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6b6b88" }}
                />
                <input
                  id="reg-email"
                  type="email"
                  className="gaming-input pl-10"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reg-phone" className="form-label">
                Phone Number *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6b6b88" }}
                />
                <input
                  id="reg-phone"
                  type="tel"
                  className="gaming-input pl-10"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              {errors.phone && (
                <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Game Selection */}
          <div>
            <label htmlFor="reg-game" className="form-label">
              Game *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["Free Fire", "PUBG"] as const).map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleChange("game", game)}
                  className="p-4 rounded-xl flex items-center gap-3 transition-all duration-300"
                  style={{
                    background:
                      form.game === game
                        ? "linear-gradient(135deg, rgba(255, 106, 0, 0.18), rgba(255, 69, 0, 0.12))"
                        : "#12121a",
                    border:
                      form.game === game
                        ? "2px solid #ff6a00"
                        : "1px solid #2a2a3a",
                    boxShadow:
                      form.game === game
                        ? "0 0 8px #ff6a00, 0 0 18px rgba(255,106,0,0.4)"
                        : "none",
                  }}
                >
                  <span className="text-2xl">
                    {game === "Free Fire" ? "🔥" : "🪖"}
                  </span>
                  <span
                    className="font-orbitron font-700 text-sm"
                    style={{ color: "#ff8c33" }}
                  >
                    {game}
                  </span>
                </button>
              ))}
            </div>
            {errors.game && (
              <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                {errors.game}
              </p>
            )}
          </div>

          {/* Game UID */}
          <div>
            <label htmlFor="reg-gameid" className="form-label">
              {form.game === "Free Fire"
                ? "Free Fire UID"
                : form.game === "PUBG"
                  ? "PUBG ID"
                  : "Game UID"}{" "}
              *
            </label>
            <input
              id="reg-gameid"
              type="text"
              className="gaming-input"
              placeholder={
                form.game === "Free Fire"
                  ? "Enter your Free Fire UID"
                  : form.game === "PUBG"
                    ? "Enter your PUBG ID"
                    : "Enter your Game UID"
              }
              value={form.gameId}
              onChange={(e) => handleChange("gameId", e.target.value)}
            />
            {errors.gameId && (
              <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                {errors.gameId}
              </p>
            )}
          </div>

          {/* Team Name */}
          <div>
            <label htmlFor="reg-teamname" className="form-label">
              Team Name (Optional)
            </label>
            <input
              id="reg-teamname"
              type="text"
              className="gaming-input"
              placeholder="Enter your team name (if applicable)"
              value={form.teamName}
              onChange={(e) => handleChange("teamName", e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-password" className="form-label">
                Password *
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6b6b88" }}
                />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="gaming-input pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "#6b6b88" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "#6b6b88" }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reg-confirm-password" className="form-label">
                Confirm Password *
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6b6b88" }}
                />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="gaming-input pl-10 pr-10"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "#6b6b88" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "#6b6b88" }} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: "#e63946" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Global submit error */}
          {submitError && (
            <div
              data-ocid="register.error_state"
              className="p-3 rounded-lg"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <p className="font-rajdhani text-sm" style={{ color: "#ef4444" }}>
                {submitError}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            data-ocid="register.submit_button"
            type="submit"
            disabled={isSubmitting}
            className="neon-btn-orange w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 mt-4"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering on blockchain…
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                Register &amp; Proceed to Payment
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
