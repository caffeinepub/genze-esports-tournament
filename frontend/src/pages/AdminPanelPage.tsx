import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, Trophy, DollarSign, Clock, Plus, Trash2, Check, X,
  LogOut, LayoutDashboard, Settings, CreditCard, ChevronDown, Eye
} from 'lucide-react';
import {
  getTournaments, saveTournaments, getPlayers, savePlayers,
  getPayments, savePayments
} from '../utils/seedData';
import type { Tournament, Player, Payment } from '../utils/seedData';

type AdminTab = 'dashboard' | 'tournaments' | 'players' | 'payments';

function notifyTournamentsUpdated() {
  // Dispatch a storage event so all open tabs/windows (including this one) refresh immediately
  window.dispatchEvent(new StorageEvent('storage', { key: 'genze_tournaments' }));
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New tournament form
  const [newTournament, setNewTournament] = useState({
    name: '',
    game: 'Free Fire' as 'Free Fire' | 'PUBG',
    entryFee: '',
    prizePool: '',
    date: '',
    time: '',
    maxSlots: '',
    rules: '',
  });
  const [tournamentError, setTournamentError] = useState('');
  const [tournamentSuccess, setTournamentSuccess] = useState('');

  // Screenshot modal
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  const UPI_ID = '7087568640@fam';

  const loadData = () => {
    setTournaments(getTournaments());
    setPlayers(getPlayers());
    setPayments(getPayments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('genze_admin_session');
    navigate({ to: '/admin/login' });
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setTournamentError('');
    setTournamentSuccess('');

    if (!newTournament.name || !newTournament.entryFee || !newTournament.prizePool ||
        !newTournament.date || !newTournament.time || !newTournament.maxSlots) {
      setTournamentError('Please fill in all required fields.');
      return;
    }

    const all = getTournaments();
    const created: Tournament = {
      id: `tournament-${Date.now()}`,
      name: newTournament.name,
      game: newTournament.game,
      entryFee: parseInt(newTournament.entryFee),
      prizePool: parseInt(newTournament.prizePool),
      date: newTournament.date,
      time: newTournament.time,
      maxSlots: parseInt(newTournament.maxSlots),
      slotsUsed: 0,
      status: 'active',
      rules: newTournament.rules,
      createdAt: Date.now(),
    };
    all.push(created);
    saveTournaments(all);
    setTournaments(all);

    // Notify all open tabs/windows that tournaments have been updated
    notifyTournamentsUpdated();

    setTournamentSuccess(`Tournament "${created.name}" created successfully!`);
    setNewTournament({ name: '', game: 'Free Fire', entryFee: '', prizePool: '', date: '', time: '', maxSlots: '', rules: '' });
  };

  const handleDeleteTournament = (id: string) => {
    const updated = getTournaments().filter((t) => t.id !== id);
    saveTournaments(updated);
    setTournaments(updated);

    // Notify all open tabs/windows
    notifyTournamentsUpdated();
  };

  const handlePlayerAction = (playerId: string, action: 'approve' | 'reject') => {
    const all = getPlayers();
    const idx = all.findIndex((p) => p.id === playerId);
    if (idx === -1) return;
    all[idx].status = action === 'approve' ? 'approved' : 'rejected';
    savePlayers(all);
    setPlayers([...all]);
  };

  const handlePaymentAction = (paymentId: string, action: 'approve' | 'reject') => {
    const all = getPayments();
    const idx = all.findIndex((p) => p.id === paymentId);
    if (idx === -1) return;
    all[idx].status = action === 'approve' ? 'approved' : 'rejected';

    // Also update the corresponding player status
    if (action === 'approve') {
      const payment = all[idx];
      const allPlayers = getPlayers();
      const pIdx = allPlayers.findIndex((p) => p.id === payment.playerId);
      if (pIdx !== -1) {
        allPlayers[pIdx].status = 'approved';
        savePlayers(allPlayers);
        setPlayers([...allPlayers]);
      }
    }

    savePayments(all);
    setPayments([...all]);
  };

  const getTournamentName = (tournamentId: string): string => {
    const t = tournaments.find((t) => t.id === tournamentId);
    return t ? t.name : tournamentId;
  };

  const pendingPlayers = players.filter((p) => p.status === 'pending');
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { id: 'players', label: 'Players', icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 py-4"
        style={{ background: '#12121a', borderBottom: '1px solid #2a2a3a' }}
      >
        <div className="flex items-center gap-3">
          <img src="/assets/generated/genze-logo.dim_256x256.png" alt="GenZe" className="w-8 h-8 rounded-lg" />
          <div>
            <div className="font-orbitron font-700 text-sm" style={{ color: '#e8e8f0' }}>GenZe Admin</div>
            <div className="font-rajdhani text-xs" style={{ color: '#6b6b88' }}>Control Panel</div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', color: '#ff6b00' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Settings className="w-4 h-4" />
          <ChevronDown className={`w-3 h-3 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-rajdhani font-600 transition-all"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
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
          style={{ background: '#12121a', borderBottom: '1px solid #2a2a3a' }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-rajdhani font-600 text-left transition-all"
              style={{
                background: activeTab === item.id ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                color: activeTab === item.id ? '#ff6b00' : '#8b8ba8',
                border: activeTab === item.id ? '1px solid rgba(255,107,0,0.3)' : '1px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-rajdhani font-600 mt-1"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
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
          style={{ background: '#0d0d15', borderRight: '1px solid #2a2a3a' }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-rajdhani font-600 text-left transition-all duration-200"
              style={{
                background: activeTab === item.id ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                color: activeTab === item.id ? '#ff6b00' : '#8b8ba8',
                border: activeTab === item.id ? '1px solid rgba(255,107,0,0.3)' : '1px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
              {item.id === 'players' && pendingPlayers.length > 0 && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-700"
                  style={{ background: 'rgba(255,107,0,0.2)', color: '#ff6b00' }}
                >
                  {pendingPlayers.length}
                </span>
              )}
              {item.id === 'payments' && pendingPayments.length > 0 && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-700"
                  style={{ background: 'rgba(255,107,0,0.2)', color: '#ff6b00' }}
                >
                  {pendingPayments.length}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="font-orbitron font-700 text-xl mb-6" style={{ color: '#e8e8f0' }}>Dashboard</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Tournaments', value: tournaments.length, icon: <Trophy className="w-5 h-5" />, color: '#ff6b00' },
                  { label: 'Total Players', value: players.length, icon: <Users className="w-5 h-5" />, color: '#7209b7' },
                  { label: 'Pending Approvals', value: pendingPlayers.length + pendingPayments.length, icon: <Clock className="w-5 h-5" />, color: '#eab308' },
                  { label: 'Total Revenue', value: `₹${payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0)}`, icon: <DollarSign className="w-5 h-5" />, color: '#22c55e' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                      {stat.icon}
                      <span className="font-rajdhani text-xs" style={{ color: '#6b6b88' }}>{stat.label}</span>
                    </div>
                    <div className="font-orbitron font-700 text-2xl" style={{ color: '#e8e8f0' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
                  <h3 className="font-orbitron font-600 text-sm mb-3" style={{ color: '#e8e8f0' }}>Recent Players</h3>
                  {players.slice(-5).reverse().map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1a1a2a' }}>
                      <div>
                        <div className="font-rajdhani font-600 text-sm" style={{ color: '#e8e8f0' }}>{p.fullName}</div>
                        <div className="font-rajdhani text-xs" style={{ color: '#6b6b88' }}>{p.game}</div>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                        style={{
                          background: p.status === 'approved' ? 'rgba(34,197,94,0.15)' : p.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                          color: p.status === 'approved' ? '#22c55e' : p.status === 'rejected' ? '#ef4444' : '#eab308',
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                  {players.length === 0 && <p className="font-rajdhani text-sm" style={{ color: '#6b6b88' }}>No players yet.</p>}
                </div>

                <div className="p-4 rounded-xl" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
                  <h3 className="font-orbitron font-600 text-sm mb-3" style={{ color: '#e8e8f0' }}>Recent Payments</h3>
                  {payments.slice(-5).reverse().map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1a1a2a' }}>
                      <div>
                        <div className="font-rajdhani font-600 text-sm" style={{ color: '#e8e8f0' }}>{p.playerName}</div>
                        <div className="font-rajdhani text-xs" style={{ color: '#6b6b88' }}>₹{p.amount}</div>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                        style={{
                          background: p.status === 'approved' ? 'rgba(34,197,94,0.15)' : p.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                          color: p.status === 'approved' ? '#22c55e' : p.status === 'rejected' ? '#ef4444' : '#eab308',
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                  {payments.length === 0 && <p className="font-rajdhani text-sm" style={{ color: '#6b6b88' }}>No payments yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── TOURNAMENTS ── */}
          {activeTab === 'tournaments' && (
            <div>
              <h2 className="font-orbitron font-700 text-xl mb-6" style={{ color: '#e8e8f0' }}>Tournament Management</h2>

              {/* Create form */}
              <div className="p-6 rounded-xl mb-6" style={{ background: '#12121a', border: '1px solid #2a2a3a' }}>
                <h3 className="font-orbitron font-600 text-base mb-4 flex items-center gap-2" style={{ color: '#e8e8f0' }}>
                  <Plus className="w-4 h-4" style={{ color: '#ff6b00' }} />
                  Create New Tournament
                </h3>
                <form onSubmit={handleCreateTournament} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Tournament Name *</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.name}
                      onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                      placeholder="e.g. Free Fire Grand Prix"
                    />
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Game *</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.game}
                      onChange={(e) => setNewTournament({ ...newTournament, game: e.target.value as 'Free Fire' | 'PUBG' })}
                    >
                      <option value="Free Fire">Free Fire</option>
                      <option value="PUBG">PUBG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Entry Fee (₹) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.entryFee}
                      onChange={(e) => setNewTournament({ ...newTournament, entryFee: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Prize Pool (₹) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.prizePool}
                      onChange={(e) => setNewTournament({ ...newTournament, prizePool: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.date}
                      onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Time *</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.time}
                      onChange={(e) => setNewTournament({ ...newTournament, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Max Slots *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      value={newTournament.maxSlots}
                      onChange={(e) => setNewTournament({ ...newTournament, maxSlots: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-rajdhani text-xs mb-1" style={{ color: '#8b8ba8' }}>Rules (Optional)</label>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg text-sm font-rajdhani resize-none"
                      style={{ background: '#0d0d15', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
                      rows={3}
                      value={newTournament.rules}
                      onChange={(e) => setNewTournament({ ...newTournament, rules: e.target.value })}
                      placeholder="Tournament rules and guidelines..."
                    />
                  </div>

                  {tournamentError && (
                    <div className="sm:col-span-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <p className="font-rajdhani text-sm" style={{ color: '#ef4444' }}>{tournamentError}</p>
                    </div>
                  )}
                  {tournamentSuccess && (
                    <div className="sm:col-span-2 p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <p className="font-rajdhani text-sm" style={{ color: '#22c55e' }}>{tournamentSuccess}</p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="neon-btn-orange px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Tournament
                    </button>
                  </div>
                </form>
              </div>

              {/* Tournament List */}
              <div className="space-y-3">
                <h3 className="font-orbitron font-600 text-sm" style={{ color: '#e8e8f0' }}>
                  All Tournaments ({tournaments.length})
                </h3>
                {tournaments.length === 0 && (
                  <div
                    className="p-8 rounded-xl text-center"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <p className="font-rajdhani text-sm" style={{ color: '#6b6b88' }}>No tournaments created yet.</p>
                  </div>
                )}
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl flex items-center justify-between gap-4"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-orbitron font-700 text-sm truncate" style={{ color: '#e8e8f0' }}>{t.name}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600 flex-shrink-0"
                          style={{
                            background: t.game === 'Free Fire' ? 'rgba(255,107,0,0.15)' : 'rgba(114,9,183,0.15)',
                            color: t.game === 'Free Fire' ? '#ff6b00' : '#b44fe8',
                          }}
                        >
                          {t.game}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600 flex-shrink-0"
                          style={{
                            background: t.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(107,107,136,0.15)',
                            color: t.status === 'active' ? '#22c55e' : '#6b6b88',
                          }}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="font-rajdhani text-xs mt-1 flex flex-wrap gap-3" style={{ color: '#6b6b88' }}>
                        <span>₹{t.entryFee} entry</span>
                        <span>₹{t.prizePool.toLocaleString('en-IN')} prize</span>
                        <span>{t.date} at {t.time}</span>
                        <span style={{ color: '#ff6b00' }}>{t.slotsUsed}/{t.maxSlots} slots filled</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTournament(t.id)}
                      className="flex-shrink-0 p-2 rounded-lg transition-all"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                      }}
                      title="Delete tournament"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PLAYERS ── */}
          {activeTab === 'players' && (
            <div>
              <h2 className="font-orbitron font-700 text-xl mb-6" style={{ color: '#e8e8f0' }}>Player Management</h2>
              <div className="space-y-3">
                {players.length === 0 && (
                  <div
                    className="p-8 rounded-xl text-center"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <p className="font-rajdhani text-sm" style={{ color: '#6b6b88' }}>No players registered yet.</p>
                  </div>
                )}
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-orbitron font-700 text-sm" style={{ color: '#e8e8f0' }}>{p.fullName}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                            style={{
                              background: p.status === 'approved' ? 'rgba(34,197,94,0.15)' : p.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                              color: p.status === 'approved' ? '#22c55e' : p.status === 'rejected' ? '#ef4444' : '#eab308',
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="font-rajdhani text-xs flex flex-wrap gap-3" style={{ color: '#6b6b88' }}>
                          <span>@{p.username}</span>
                          <span>{p.email}</span>
                          <span>{p.phone}</span>
                          <span>{p.game}</span>
                          <span>ID: {p.gameId}</span>
                          {p.teamName && <span>Team: {p.teamName}</span>}
                          <span>Tournament: {getTournamentName(p.tournamentId)}</span>
                        </div>
                      </div>
                      {p.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handlePlayerAction(p.id, 'approve')}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePlayerAction(p.id, 'reject')}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
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
          {activeTab === 'payments' && (
            <div>
              <h2 className="font-orbitron font-700 text-xl mb-6" style={{ color: '#e8e8f0' }}>Payment Management</h2>

              {/* UPI Info */}
              <div
                className="p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{ background: '#12121a', border: '1px solid rgba(255,107,0,0.3)' }}
              >
                <img
                  src="/assets/generated/upi-qr-code.dim_400x400.png"
                  alt="UPI QR Code"
                  className="w-20 h-20 rounded-lg object-contain"
                  style={{ background: 'white', padding: '4px' }}
                />
                <div>
                  <div className="font-orbitron font-700 text-sm mb-1" style={{ color: '#ff6b00' }}>UPI Payment Details</div>
                  <div className="font-rajdhani text-sm" style={{ color: '#e8e8f0' }}>UPI ID: <span style={{ color: '#ff6b00' }}>{UPI_ID}</span></div>
                  <div className="font-rajdhani text-xs mt-1" style={{ color: '#6b6b88' }}>Verify payment screenshots below before approving</div>
                </div>
              </div>

              <div className="space-y-3">
                {payments.length === 0 && (
                  <div
                    className="p-8 rounded-xl text-center"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <p className="font-rajdhani text-sm" style={{ color: '#6b6b88' }}>No payments submitted yet.</p>
                  </div>
                )}
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl"
                    style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-orbitron font-700 text-sm" style={{ color: '#e8e8f0' }}>{p.playerName}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-rajdhani font-600"
                            style={{
                              background: p.status === 'approved' ? 'rgba(34,197,94,0.15)' : p.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                              color: p.status === 'approved' ? '#22c55e' : p.status === 'rejected' ? '#ef4444' : '#eab308',
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="font-rajdhani text-xs flex flex-wrap gap-3" style={{ color: '#6b6b88' }}>
                          <span>₹{p.amount}</span>
                          <span>{p.tournamentName}</span>
                          <span>{new Date(p.submittedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        {p.screenshotData && (
                          <button
                            onClick={() => setViewScreenshot(p.screenshotData)}
                            className="mt-2 flex items-center gap-1 text-xs font-rajdhani font-600 transition-colors"
                            style={{ color: '#ff6b00' }}
                          >
                            <Eye className="w-3 h-3" />
                            View Screenshot
                          </button>
                        )}
                      </div>
                      {p.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handlePaymentAction(p.id, 'approve')}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePaymentAction(p.id, 'reject')}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setViewScreenshot(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-xl overflow-hidden"
            style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #2a2a3a' }}>
              <span className="font-orbitron font-600 text-sm" style={{ color: '#e8e8f0' }}>Payment Screenshot</span>
              <button onClick={() => setViewScreenshot(null)} style={{ color: '#6b6b88' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img src={viewScreenshot} alt="Payment Screenshot" className="w-full rounded-lg object-contain max-h-96" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
