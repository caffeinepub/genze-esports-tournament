import { Link } from "@tanstack/react-router";
import { Heart, Zap } from "lucide-react";
import {
  SiDiscord,
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || "genze-esports");

  return (
    <footer
      style={{
        background: "#0d0d15",
        borderTop: "1px solid #2a2a3a",
      }}
    >
      {/* Top gradient line */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #ff6b00, #e63946)",
                }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span
                  className="font-orbitron font-900 text-xl tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #ff6b00, #e63946)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  GenZe
                </span>
                <span className="font-orbitron font-400 text-xl tracking-wider text-white ml-1">
                  Esports
                </span>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-6 text-boundary"
              style={{ color: "#ff8c33", maxWidth: "320px" }}
            >
              India's premier esports tournament platform for Free Fire and
              PUBG. Compete, win, and rise to the top.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                { icon: SiFacebook, label: "Facebook", color: "#1877f2" },
                { icon: SiX, label: "X (Twitter)", color: "#e8e8f0" },
                { icon: SiInstagram, label: "Instagram", color: "#e1306c" },
                { icon: SiDiscord, label: "Discord", color: "#5865f2" },
                { icon: SiYoutube, label: "YouTube", color: "#ff0000" },
              ].map(({ icon: Icon, label, color }) => (
                <a
                  key={label}
                  href="/"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{ background: "#1a1a26", border: "1px solid #2a2a3a" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      `0 0 10px ${color}40`;
                    (e.currentTarget as HTMLElement).style.color = color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "#2a2a3a";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.color = "#6b6b88";
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#6b6b88" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-orbitron text-sm font-700 tracking-wider mb-4"
              style={{ color: "#ff6b00" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Home", path: "/" },
                { label: "Tournaments", path: "/tournaments" },
                { label: "Register", path: "/register" },
                { label: "Leaderboard", path: "/leaderboard" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm transition-colors duration-200 text-boundary"
                    style={{ color: "#ff8c33" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#ffaa55";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#ff8c33";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-orbitron text-sm font-700 tracking-wider mb-4"
              style={{ color: "#ff6b00" }}
            >
              Contact
            </h4>
            <ul
              className="space-y-2 text-sm text-boundary"
              style={{ color: "#ff8c33" }}
            >
              <li>📧 genZeSports2026@gmail.com</li>
              <li>💳 UPI: 7087568640@fam</li>
              <li>🎮 Free Fire & PUBG Tournaments</li>
              <li>🇮🇳 India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid #2a2a3a" }}
        >
          <p className="text-xs text-boundary" style={{ color: "#ff8c33" }}>
            © {year} GenZe Esports. All rights reserved.
          </p>
          <p
            className="text-xs flex items-center gap-1 text-boundary"
            style={{ color: "#ff8c33" }}
          >
            Built with{" "}
            <Heart className="w-3 h-3 inline" style={{ color: "#ff6b00" }} />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "#ff6b00" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#ff8c33";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#ff6b00";
              }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
