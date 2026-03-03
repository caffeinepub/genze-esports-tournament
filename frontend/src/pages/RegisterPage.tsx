import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { User, Mail, Phone, Gamepad2, Shield, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { getTournaments, getPlayers, savePlayers, incrementTournamentSlots } from '../utils/seedData';
import type { Tournament, Player } from '../utils/seedData';

function notifyTournamentsUpdated() {
  // Dispatch a storage event so all open tabs/windows (including this one) refresh slot counts immediately
  window.dispatchEvent(new StorageEvent('storage', { key: 'genze_tournaments' }));
}

export default function RegisterPage() {
  const navigate = useNavigate();
  // Use strict: false to avoid route ID mismatch with nested layout routes
  const search = useSearch({ strict: false }) as { tournamentId?: string };
  const tournamentId = search.tournamentId || '';

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    game: '' as 'Free Fire' | 'PUBG' | '',
    gameId: '',
    teamName: '',
    tournamentId: tournamentId,
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const t = getTournaments();
    setTournaments(t.filter((x) => x.status === 'active'));
    if (tournamentId) {
      const found = t.find((x) => x.id === tournamentId);
      if (found) {
        setSelectedTournament(found);
        setForm((prev) => ({ ...prev, game: found.game, tournamentId: found.id }));
      }
    }
  }, [tournamentId]);

  useEffect(() => {
    if (form.tournamentId) {
      const found = tournaments.find((t) => t.id === form.tournamentId);
      setSelectedTournament(found || null);
      if (found) setForm((prev) => ({ ...prev, game: found.game }));
    }
  }, [form.tournamentId, tournaments]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit Indian mobile number';
    if (!form.game) newErrors.game = 'Please select a game';
    if (!form.gameId.trim()) newErrors.gameId = 'Game ID is required';
    if (!form.tournamentId) newErrors.tournamentId = 'Please select a tournament';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      phone: form.phone,
      game: form.game as 'Free Fire' | 'PUBG',
      gameId: form.gameId,
      teamName: form.teamName,
      tournamentId: form.tournamentId,
      status: 'pending',
      registeredAt: Date.now(),
    };

    const players = getPlayers();
    players.push(newPlayer);
    savePlayers(players);

    // Increment the tournament's slot count by 1
    incrementTournamentSlots(form.tournamentId);

    // Notify all open tabs/windows that slot counts have changed
    notifyTournamentsUpdated();

    setTimeout(() => {
      setIsSubmitting(false);
      navigate({
        to: '/payment',
        search: {
          playerId: newPlayer.id,
          tournamentId: form.tournamentId,
          amount: String(selectedTournament?.entryFee || 0),
        },
      });
    }, 500);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="py-12 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.06), rgba(114, 9, 183, 0.06))',
          borderBottom: '1px solid #2a2a3a',
        }}
      >
        <h1 className="section-heading text-3xl sm:text-4xl mb-3" style={{ color: '#e8e8f0' }}>
          Player <span className="neon-text-orange">Registration</span>
        </h1>
        <p className="font-rajdhani text-base" style={{ color: '#6b6b88' }}>
          Fill in your details to join the tournament
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Selected Tournament Banner */}
        {selectedTournament && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1), rgba(114, 9, 183, 0.1))',
              border: '1px solid rgba(255, 107, 0, 0.3)',
            }}
          >
            <div>
              <div className="font-orbitron font-700 text-sm" style={{ color: '#e8e8f0' }}>
                {selectedTournament.name}
              </div>
              <div className="font-rajdhani text-xs mt-1" style={{ color: '#8b8ba8' }}>
                {selectedTournament.game} • {selectedTournament.date} at {selectedTournament.time}
              </div>
            </div>
            <div className="text-right">
              <div className="font-orbitron font-800 text-xl" style={{ color: '#ff6b00' }}>
                ₹{selectedTournament.entryFee}
              </div>
              <div className="text-xs" style={{ color: '#6b6b88' }}>Entry Fee</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tournament Selection */}
          <div>
            <label className="form-label">Select Tournament *</label>
            <div className="relative">
              <select
                className="gaming-select"
                value={form.tournamentId}
                onChange={(e) => handleChange('tournamentId', e.target.value)}
              >
                <option value="">-- Select Tournament --</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — ₹{t.entryFee} Entry
                  </option>
                ))}
              </select>
              <ChevronRight
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 pointer-events-none"
                style={{ color: '#6b6b88' }}
              />
            </div>
            {errors.tournamentId && (
              <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.tournamentId}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="form-label">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b6b88' }} />
              <input
                type="text"
                className="gaming-input pl-10"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="form-label">Username / Game ID *</label>
            <div className="relative">
              <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b6b88' }} />
              <input
                type="text"
                className="gaming-input pl-10"
                placeholder="Your in-game username"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </div>
            {errors.username && (
              <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.username}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b6b88' }} />
                <input
                  type="email"
                  className="gaming-input pl-10"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.email}</p>
              )}
            </div>
            <div>
              <label className="form-label">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b6b88' }} />
                <input
                  type="tel"
                  className="gaming-input pl-10"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              {errors.phone && (
                <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Game Selection */}
          <div>
            <label className="form-label">Game *</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Free Fire', 'PUBG'] as const).map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleChange('game', game)}
                  className="p-4 rounded-xl flex items-center gap-3 transition-all duration-300"
                  style={{
                    background: form.game === game
                      ? game === 'Free Fire'
                        ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(230, 57, 70, 0.2))'
                        : 'linear-gradient(135deg, rgba(230, 57, 70, 0.2), rgba(114, 9, 183, 0.2))'
                      : '#12121a',
                    border: form.game === game
                      ? `1px solid ${game === 'Free Fire' ? '#ff6b00' : '#e63946'}`
                      : '1px solid #2a2a3a',
                    boxShadow: form.game === game
                      ? `0 0 15px ${game === 'Free Fire' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(230, 57, 70, 0.2)'}`
                      : 'none',
                  }}
                >
                  <span className="text-2xl">{game === 'Free Fire' ? '🔥' : '🪖'}</span>
                  <span className="font-orbitron font-700 text-sm" style={{ color: '#e8e8f0' }}>
                    {game}
                  </span>
                </button>
              ))}
            </div>
            {errors.game && (
              <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.game}</p>
            )}
          </div>

          {/* Game UID */}
          <div>
            <label className="form-label">
              {form.game === 'Free Fire' ? 'Free Fire UID' : form.game === 'PUBG' ? 'PUBG ID' : 'Game UID'} *
            </label>
            <input
              type="text"
              className="gaming-input"
              placeholder={
                form.game === 'Free Fire'
                  ? 'Enter your Free Fire UID'
                  : form.game === 'PUBG'
                    ? 'Enter your PUBG ID'
                    : 'Enter your Game UID'
              }
              value={form.gameId}
              onChange={(e) => handleChange('gameId', e.target.value)}
            />
            {errors.gameId && (
              <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.gameId}</p>
            )}
          </div>

          {/* Team Name */}
          <div>
            <label className="form-label">Team Name (Optional)</label>
            <input
              type="text"
              className="gaming-input"
              placeholder="Enter your team name (if applicable)"
              value={form.teamName}
              onChange={(e) => handleChange('teamName', e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b6b88' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="gaming-input pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" style={{ color: '#6b6b88' }} />
                    : <Eye className="w-4 h-4" style={{ color: '#6b6b88' }} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.password}</p>
              )}
            </div>
            <div>
              <label className="form-label">Confirm Password *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b6b88' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="gaming-input pl-10 pr-10"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword
                    ? <EyeOff className="w-4 h-4" style={{ color: '#6b6b88' }} />
                    : <Eye className="w-4 h-4" style={{ color: '#6b6b88' }} />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: '#e63946' }}>{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="neon-btn-orange w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 mt-4"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing...
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
