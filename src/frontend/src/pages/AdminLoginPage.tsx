import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const ADMIN_EMAIL = "genZeSports2026@gmail.com";
const ADMIN_PASSWORD = "GenZe@2026";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid credentials. Please check your email and password.");
      setIsLoading(false);
      return;
    }

    // Store local session
    localStorage.setItem(
      "genze_admin_session",
      JSON.stringify({ isAdmin: true, timestamp: Date.now() }),
    );

    // Also authenticate with backend canister to get a token for admin operations
    if (actor) {
      try {
        const token = await actor.authenticateAdmin(email, password);
        localStorage.setItem("genze_admin_token", token);
      } catch {
        // Backend auth failed — local login still proceeds, but token won't be available
        localStorage.removeItem("genze_admin_token");
      }
    }

    setIsLoading(false);
    navigate({ to: "/admin" });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Background effects */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(114, 9, 183, 0.08) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255, 107, 0, 0.06) 0%, transparent 60%)",
        }}
      />
      <div className="hex-grid absolute inset-0 opacity-30" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(114, 9, 183, 0.2), rgba(255, 107, 0, 0.2))",
              border: "1px solid rgba(114, 9, 183, 0.4)",
              boxShadow: "0 0 30px rgba(114, 9, 183, 0.2)",
            }}
          >
            <Lock className="w-10 h-10" style={{ color: "#b44fe8" }} />
          </div>
          <h1
            className="font-orbitron font-800 text-2xl sm:text-3xl mb-2 text-boundary-strong"
            style={{ color: "#f0f0f8" }}
          >
            Admin <span className="neon-text-purple">Portal</span>
          </h1>
          <p
            className="font-rajdhani text-sm text-boundary"
            style={{ color: "#b8b8d0" }}
          >
            GenZe Esports — Restricted Access
          </p>
        </div>

        {/* Login Card */}
        <div
          className="p-8 rounded-2xl"
          style={{
            background: "#12121a",
            border: "1px solid #2a2a3a",
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {error && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{
                background: "rgba(230, 57, 70, 0.1)",
                border: "1px solid rgba(230, 57, 70, 0.3)",
              }}
            >
              <AlertCircle
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "#e63946" }}
              />
              <p className="font-rajdhani text-sm" style={{ color: "#e63946" }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="form-label">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6b6b88" }}
                />
                <input
                  id="admin-email"
                  type="email"
                  className="gaming-input pl-10"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6b6b88" }}
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="gaming-input pl-10 pr-10"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neon-btn-purple w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 p-3 rounded-lg text-center"
            style={{
              background: "rgba(255, 107, 0, 0.08)",
              border: "1px solid rgba(255, 107, 0, 0.2)",
            }}
          >
            <p
              className="font-rajdhani text-xs text-boundary"
              style={{ color: "#a0a0b8" }}
            >
              🔒 This area is restricted to authorized administrators only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
