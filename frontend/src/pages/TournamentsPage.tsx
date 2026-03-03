import { useState, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import TournamentCard from '../components/TournamentCard';
import { getTournaments } from '../utils/seedData';
import type { Tournament } from '../utils/seedData';

type FilterType = 'All' | 'Free Fire' | 'PUBG';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<FilterType>('All');

  const refreshTournaments = useCallback(() => {
    setTournaments(getTournaments());
  }, []);

  useEffect(() => {
    refreshTournaments();

    // Listen for localStorage changes from other tabs/windows AND same-tab dispatches
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'genze_tournaments' || e.key === null) {
        refreshTournaments();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll every 3 seconds to catch any missed updates
    const interval = setInterval(refreshTournaments, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refreshTournaments]);

  const filtered = filter === 'All'
    ? tournaments
    : tournaments.filter((t) => t.game === filter);

  const visibleTournaments = filtered.filter((t) => t.status === 'active');

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Page Header */}
      <div
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.06), rgba(114, 9, 183, 0.06))',
          borderBottom: '1px solid #2a2a3a',
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("/assets/generated/hero-banner.dim_1920x600.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(10, 10, 15, 0.85)' }} />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="section-heading text-3xl sm:text-4xl md:text-5xl mb-4" style={{ color: '#e8e8f0' }}>
            All <span className="neon-text-orange">Tournaments</span>
          </h1>
          <p className="font-rajdhani text-base sm:text-lg" style={{ color: '#6b6b88' }}>
            Choose your battle and register before slots fill up
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#6b6b88' }} />
            <span className="font-rajdhani text-sm font-600 tracking-wider uppercase" style={{ color: '#6b6b88' }}>
              Filter by Game:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Free Fire', 'PUBG'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-lg text-xs font-orbitron font-600 tracking-wider transition-all duration-300"
                style={{
                  background: filter === f
                    ? f === 'Free Fire'
                      ? 'linear-gradient(135deg, #ff6b00, #e63946)'
                      : f === 'PUBG'
                        ? 'linear-gradient(135deg, #e63946, #7209b7)'
                        : 'linear-gradient(135deg, #ff6b00, #7209b7)'
                    : '#12121a',
                  border: filter === f
                    ? 'none'
                    : '1px solid #2a2a3a',
                  color: filter === f ? 'white' : '#6b6b88',
                  boxShadow: filter === f ? '0 0 15px rgba(255, 107, 0, 0.3)' : 'none',
                }}
              >
                {f === 'Free Fire' ? '🔥 ' : f === 'PUBG' ? '🪖 ' : '⚡ '}{f}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="mb-6">
          <span className="font-rajdhani text-sm" style={{ color: '#6b6b88' }}>
            Showing{' '}
            <span style={{ color: '#ff6b00' }}>{visibleTournaments.length}</span>
            {' '}tournament{visibleTournaments.length !== 1 ? 's' : ''}
            {filter !== 'All' && ` for ${filter}`}
          </span>
        </div>

        {/* Tournament Grid */}
        {visibleTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-xl"
            style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
          >
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="font-orbitron font-700 text-lg mb-2" style={{ color: '#e8e8f0' }}>
              No Tournaments Yet
            </h3>
            <p className="font-rajdhani text-sm" style={{ color: '#6b6b88', maxWidth: '320px', margin: '0 auto' }}>
              {filter !== 'All'
                ? `No ${filter} tournaments available right now. Check back soon!`
                : 'The admin hasn\'t created any tournaments yet. Check back soon!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
