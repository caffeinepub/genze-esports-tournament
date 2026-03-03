import { useNavigate } from '@tanstack/react-router';
import { Calendar, Clock, Users, Trophy, Zap } from 'lucide-react';
import type { Tournament } from '../utils/seedData';

interface TournamentCardProps {
  tournament: Tournament;
  showRegister?: boolean;
}

export default function TournamentCard({ tournament, showRegister = true }: TournamentCardProps) {
  const navigate = useNavigate();
  const slotsLeft = tournament.maxSlots - tournament.slotsUsed;
  const slotsPercent = (tournament.slotsUsed / tournament.maxSlots) * 100;

  const isFF = tournament.game === 'Free Fire';

  const handleRegister = () => {
    navigate({ to: '/register', search: { tournamentId: tournament.id } });
  };

  return (
    <div
      className="gaming-card gradient-border group cursor-pointer"
      style={{ padding: '0' }}
    >
      {/* Card Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          background: isFF
            ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.12), rgba(230, 57, 70, 0.08))'
            : 'linear-gradient(135deg, rgba(230, 57, 70, 0.12), rgba(114, 9, 183, 0.08))',
          borderBottom: '1px solid #2a2a3a',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
            style={{
              background: isFF
                ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(230, 57, 70, 0.2))'
                : 'linear-gradient(135deg, rgba(230, 57, 70, 0.2), rgba(114, 9, 183, 0.2))',
              border: `1px solid ${isFF ? 'rgba(255, 107, 0, 0.3)' : 'rgba(230, 57, 70, 0.3)'}`,
            }}
          >
            <img
              src={isFF ? '/assets/generated/ff-badge.dim_128x128.png' : '/assets/generated/pubg-badge.dim_128x128.png'}
              alt={tournament.game}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                const parent = el.parentElement;
                if (parent) {
                  parent.innerHTML = isFF ? '🔥' : '🪖';
                  parent.style.fontSize = '1.5rem';
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                }
              }}
            />
          </div>
          <div>
            <span className={isFF ? 'badge-ff' : 'badge-pubg'}>
              {isFF ? 'FREE FIRE' : 'PUBG'}
            </span>
            <h3
              className="font-orbitron font-700 text-sm mt-1 leading-tight"
              style={{ color: '#e8e8f0' }}
            >
              {tournament.name}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <div className="font-orbitron font-800 text-lg" style={{ color: '#ff6b00' }}>
            ₹{tournament.entryFee}
          </div>
          <div className="text-xs" style={{ color: '#6b6b88' }}>Entry Fee</div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Prize Pool */}
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ background: 'rgba(114, 9, 183, 0.08)', border: '1px solid rgba(114, 9, 183, 0.2)' }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: '#b44fe8' }} />
            <span className="text-xs font-rajdhani font-600 tracking-wider uppercase" style={{ color: '#8b8ba8' }}>
              Prize Pool
            </span>
          </div>
          <span className="font-orbitron font-700 text-base" style={{ color: '#b44fe8' }}>
            ₹{tournament.prizePool.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6b6b88' }} />
            <span className="text-xs" style={{ color: '#8b8ba8' }}>
              {new Date(tournament.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6b6b88' }} />
            <span className="text-xs" style={{ color: '#8b8ba8' }}>{tournament.time} IST</span>
          </div>
        </div>

        {/* Slots */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" style={{ color: '#6b6b88' }} />
              <span className="text-xs" style={{ color: '#8b8ba8' }}>
                {slotsLeft} slots left
              </span>
            </div>
            <span className="text-xs font-600" style={{ color: slotsLeft < 5 ? '#e63946' : '#6b6b88' }}>
              {tournament.slotsUsed}/{tournament.maxSlots}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: '#1a1a26' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${slotsPercent}%`,
                background: slotsPercent > 80
                  ? 'linear-gradient(90deg, #e63946, #ff6b00)'
                  : 'linear-gradient(90deg, #ff6b00, #b44fe8)',
              }}
            />
          </div>
        </div>

        {/* Register Button */}
        {showRegister && (
          <button
            onClick={handleRegister}
            className="neon-btn-orange w-full py-2.5 rounded-lg text-sm font-orbitron font-700 tracking-wider flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Register Now
          </button>
        )}
      </div>
    </div>
  );
}
