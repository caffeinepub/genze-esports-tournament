import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Shield,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useRef } from "react";
import StatsCounter from "../components/StatsCounter";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: "#0a0a0f" }}>
      {/* Hero Section */}
      <section className="hero-section scanlines" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hex-grid" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.6) 40%, rgba(114,9,183,0.12) 60%, rgba(10,10,15,0.92) 100%)",
            zIndex: 2,
          }}
        />

        {/* Animated particles */}
        <div
          className="absolute inset-0"
          style={{ zIndex: 2, pointerEvents: "none" }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${(i % 3) + 3}px`,
                height: `${(i % 3) + 3}px`,
                background:
                  i % 3 === 0 ? "#ff6b00" : i % 3 === 1 ? "#e63946" : "#b44fe8",
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                opacity: 0.6,
                animation: `heroFloat ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-in"
              style={{
                background: "rgba(255, 107, 0, 0.1)",
                border: "1px solid rgba(255, 107, 0, 0.3)",
                opacity: 1,
              }}
            >
              <span className="pulse-dot" />
              <span
                className="font-rajdhani text-sm font-600 tracking-wider"
                style={{ color: "#ff8c33" }}
              >
                LIVE TOURNAMENTS AVAILABLE
              </span>
            </div>

            {/* Main Heading */}
            <h1
              className="font-orbitron font-900 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 text-boundary-strong"
              style={{ opacity: 1, color: "#f0f0f8" }}
            >
              <span className="neon-heading neon-text-boundary">GenZe</span>
              <br />
              <span style={{ color: "#f0f0f8" }}>Esports</span>
            </h1>

            <p
              className="font-rajdhani text-lg sm:text-xl font-400 mb-8 leading-relaxed text-boundary"
              style={{
                color: "#c8c8e0",
                maxWidth: "520px",
                opacity: 1,
              }}
            >
              India's most exciting Free Fire &amp; PUBG tournament platform.
              Compete for glory, win real prizes, and prove you're the best.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{ opacity: 1 }}
            >
              <Link
                to="/tournaments"
                className="neon-btn-orange px-8 py-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                View Tournaments
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                search={{ tournamentId: "" }}
                className="neon-btn-outline px-8 py-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                Register Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-10" style={{ opacity: 1 }}>
              {[
                { label: "Free Fire", icon: "🔥" },
                { label: "PUBG", icon: "🪖" },
                { label: "Cash Prizes", icon: "💰" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className="font-rajdhani font-600 text-sm tracking-wider text-boundary"
                    style={{ color: "#b0b0cc" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsCounter />

      {/* Features Section */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: "#0a0a0f" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="section-heading text-2xl sm:text-3xl mb-3"
              style={{ color: "#f0f0f8" }}
            >
              Why Choose{" "}
              <span className="neon-text-orange neon-text-orange-boundary">
                GenZe Esports?
              </span>
            </h2>
            <p
              className="font-rajdhani text-sm text-boundary"
              style={{ color: "#b8b8d0", maxWidth: "480px", margin: "0 auto" }}
            >
              The most trusted esports tournament platform for Indian gamers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Trophy className="w-6 h-6" />,
                title: "Real Cash Prizes",
                desc: "Win real money directly transferred to your account. No delays, no excuses.",
                color: "#ff6b00",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Fair Play Guaranteed",
                desc: "Anti-cheat measures and strict rules ensure every match is fair and competitive.",
                color: "#e63946",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Growing Community",
                desc: "Join thousands of players competing in Free Fire and PUBG tournaments.",
                color: "#7209b7",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Registration",
                desc: "Register in minutes. Fill the form, pay the entry fee, and you're in.",
                color: "#ff6b00",
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "Leaderboard Rankings",
                desc: "Track your performance and climb the leaderboard to prove your skills.",
                color: "#e63946",
              },
              {
                icon: <ChevronRight className="w-6 h-6" />,
                title: "Regular Tournaments",
                desc: "New tournaments every week. There's always a battle waiting for you.",
                color: "#7209b7",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="gaming-card p-6 group hover:scale-[1.02] transition-transform duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${feature.color}18`,
                    border: `1px solid ${feature.color}40`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="font-orbitron font-700 text-sm mb-2 text-boundary"
                  style={{ color: "#f0f0f8" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="font-rajdhani text-sm leading-relaxed text-boundary"
                  style={{ color: "#b0b0c8" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(114, 9, 183, 0.08))",
          borderTop: "1px solid #2a2a3a",
          borderBottom: "1px solid #2a2a3a",
        }}
      >
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2
            className="section-heading text-2xl sm:text-3xl mb-4"
            style={{ color: "#f0f0f8" }}
          >
            Ready to{" "}
            <span className="neon-text-orange neon-text-orange-boundary">
              Compete?
            </span>
          </h2>
          <p
            className="font-rajdhani text-base mb-8 text-boundary"
            style={{ color: "#c0c0d8" }}
          >
            Join the battle today. Register for a tournament and show the world
            what you're made of.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tournaments"
              className="neon-btn-orange px-8 py-4 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Browse Tournaments
            </Link>
            <Link
              to="/register"
              search={{ tournamentId: "" }}
              className="neon-btn-outline px-8 py-4 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              Register Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
