import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Tournaments", path: "/tournaments" },
    { label: "Register", path: "/register" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        borderBottom: "1px solid rgba(255, 106, 0, 0.35)",
        boxShadow: "0 2px 20px rgba(255, 106, 0, 0.15)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/assets/generated/genze-logo.dim_256x256.png"
                alt="GenZe Esports"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, #ff6b00, #e63946)",
                  display: "none",
                }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span
                className="font-orbitron font-900 text-lg tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #ff6b00, #e63946)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                GenZe
              </span>
              <span className="font-orbitron font-400 text-lg tracking-wider text-white ml-1">
                Esports
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Admin + Mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded text-xs font-orbitron font-600 tracking-wider transition-all duration-300"
              style={{
                border: "2px solid #ff9500",
                color: "#ff9500",
                boxShadow: "0 0 8px #ff9500, 0 0 16px rgba(255,149,0,0.4)",
                textShadow:
                  "0 0 6px #ff9500, 1px 1px 0 rgba(0,0,0,0.7), -1px -1px 0 rgba(0,0,0,0.7)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255, 106, 0, 0.12)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 12px #ff9500, 0 0 28px rgba(255,149,0,0.6)";
                (e.currentTarget as HTMLElement).style.color = "#ffbe55";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 8px #ff9500, 0 0 16px rgba(255,149,0,0.4)";
                (e.currentTarget as HTMLElement).style.color = "#ff9500";
              }}
            >
              Admin
            </Link>

            <button
              type="button"
              className="md:hidden p-2 rounded"
              style={{ color: "#ff8c33" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu md:hidden">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm ${isActive(link.path) ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="nav-link text-sm"
              style={{ color: "#ff9500" }}
              onClick={() => setMobileOpen(false)}
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
