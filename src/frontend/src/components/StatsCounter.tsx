import { DollarSign, Trophy, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPlayers, getTournaments } from "../utils/seedData";

interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

function useCountUp(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(startValue + (target - startValue) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration, started]);

  return count;
}

function StatCard({ stat, started }: { stat: StatItem; started: boolean }) {
  const count = useCountUp(stat.value, 2000, started);

  return (
    <div className="stats-card">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
        style={{
          background: `${stat.color}20`,
          border: `1px solid ${stat.color}40`,
        }}
      >
        <div style={{ color: stat.color }}>{stat.icon}</div>
      </div>
      <div
        className="font-orbitron text-3xl font-800 mb-2 text-neon-boundary"
        style={{ color: stat.color }}
      >
        {stat.prefix}
        {count.toLocaleString("en-IN")}
        {stat.suffix}
      </div>
      <div
        className="font-rajdhani text-sm font-600 tracking-wider uppercase text-boundary"
        style={{ color: "#b8b8d0" }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export default function StatsCounter() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const tournaments = getTournaments();
  const players = getPlayers();
  const totalPrize = tournaments.reduce((sum, t) => sum + t.prizePool, 0);

  const stats: StatItem[] = [
    {
      label: "Registered Players",
      value: Math.max(players.length, 1250),
      icon: <Users className="w-7 h-7" />,
      color: "#ff6b00",
    },
    {
      label: "Tournaments Held",
      value: Math.max(tournaments.length, 48),
      icon: <Trophy className="w-7 h-7" />,
      color: "#e63946",
    },
    {
      label: "Total Prize Pool",
      value: Math.max(totalPrize, 50000),
      prefix: "₹",
      icon: <DollarSign className="w-7 h-7" />,
      color: "#b44fe8",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} started={started} />
      ))}
    </div>
  );
}
