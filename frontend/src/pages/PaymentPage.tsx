import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Upload, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { getTournaments, getPlayers, getPayments, savePayments } from '../utils/seedData';
import type { Tournament, Player } from '../utils/seedData';

export default function PaymentPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { playerId?: string; tournamentId?: string; amount?: string };

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const UPI_ID = '7087568640@fam';
  const amount = search.amount ? parseInt(search.amount) : 0;

  useEffect(() => {
    if (search.tournamentId) {
      const t = getTournaments().find((x) => x.id === search.tournamentId);
      setTournament(t || null);
    }
    if (search.playerId) {
      const p = getPlayers().find((x) => x.id === search.playerId);
      setPlayer(p || null);
    }
  }, [search.tournamentId, search.playerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) return;
    setIsSubmitting(true);

    const payments = getPayments();
    payments.push({
      id: `payment-${Date.now()}`,
      playerId: search.playerId || '',
      playerName: player?.fullName || 'Unknown',
      tournamentId: search.tournamentId || '',
      tournamentName: tournament?.name || 'Unknown',
      amount: amount,
      screenshotData: screenshotPreview,
      screenshotName: screenshot.name,
      status: 'pending',
      submittedAt: Date.now(),
    });
    savePayments(payments);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#0a0a0f' }}
      >
        <div
          className="max-w-md w-full text-center p-8 rounded-2xl"
          style={{
            background: '#12121a',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.1)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34, 197, 94, 0.15)', border: '2px solid rgba(34, 197, 94, 0.4)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="font-orbitron font-800 text-2xl mb-3" style={{ color: '#e8e8f0' }}>
            Payment Submitted!
          </h2>
          <div
            className="inline-block px-4 py-2 rounded-full mb-4 text-sm font-rajdhani font-600"
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              color: '#eab308',
            }}
          >
            ⏳ Payment Confirmation Pending
          </div>
          <p className="font-rajdhani text-sm leading-relaxed mb-6" style={{ color: '#8b8ba8' }}>
            Your payment screenshot has been submitted for verification. Our admin team will review and approve your registration within 24 hours.
          </p>
          <div
            className="p-4 rounded-xl mb-6 text-left space-y-2"
            style={{ background: '#0d0d15', border: '1px solid #2a2a3a' }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6b6b88' }}>Tournament:</span>
              <span className="font-600" style={{ color: '#e8e8f0' }}>{tournament?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6b6b88' }}>Amount Paid:</span>
              <span className="font-orbitron font-700" style={{ color: '#ff6b00' }}>₹{amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6b6b88' }}>UPI ID:</span>
              <span className="font-600" style={{ color: '#e8e8f0' }}>{UPI_ID}</span>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: '/' })}
            className="neon-btn-orange w-full py-3 rounded-xl text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
          Complete <span className="neon-text-orange">Payment</span>
        </h1>
        <p className="font-rajdhani text-base" style={{ color: '#6b6b88' }}>
          Pay via UPI and upload your payment screenshot
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Tournament Info */}
        {tournament && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(114, 9, 183, 0.08))',
              border: '1px solid rgba(255, 107, 0, 0.2)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-orbitron font-700 text-sm" style={{ color: '#e8e8f0' }}>
                  {tournament.name}
                </div>
                <div className="font-rajdhani text-xs mt-1" style={{ color: '#8b8ba8' }}>
                  {tournament.game} • {tournament.date} at {tournament.time}
                </div>
              </div>
              <div className="text-right">
                <div className="font-orbitron font-800 text-2xl" style={{ color: '#ff6b00' }}>
                  ₹{amount}
                </div>
                <div className="text-xs" style={{ color: '#6b6b88' }}>Entry Fee</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div
          className="mb-6 p-6 rounded-xl"
          style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
        >
          <h2 className="font-orbitron font-700 text-base mb-4" style={{ color: '#e8e8f0' }}>
            Payment Instructions
          </h2>

          <div
            className="p-4 rounded-xl mb-4 text-center"
            style={{
              background: 'rgba(255, 107, 0, 0.08)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
            }}
          >
            <div className="font-rajdhani text-sm mb-1" style={{ color: '#8b8ba8' }}>
              Pay ₹{amount} to UPI ID:
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-orbitron font-700 text-xl" style={{ color: '#ff6b00' }}>
                {UPI_ID}
              </span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                  border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 107, 0, 0.4)'}`,
                }}
                title="Copy UPI ID"
              >
                {copied
                  ? <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
                  : <Copy className="w-4 h-4" style={{ color: '#ff6b00' }} />
                }
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="font-rajdhani text-sm mb-3" style={{ color: '#8b8ba8' }}>
                Scan QR Code to Pay
              </div>
              <div
                className="inline-block p-2 rounded-xl"
                style={{ background: '#ffffff', border: '2px solid rgba(255, 107, 0, 0.4)' }}
              >
                <img
                  src="/assets/generated/upi-qr-code.dim_400x400.png"
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="block rounded-lg"
                  style={{ width: 200, height: 200, objectFit: 'contain' }}
                />
              </div>
              <div className="mt-2 font-rajdhani text-xs" style={{ color: '#6b6b88' }}>
                UPI ID: {UPI_ID}
              </div>
            </div>

            <div
              className="w-full p-3 rounded-lg"
              style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#eab308' }} />
                <div className="font-rajdhani text-xs leading-relaxed" style={{ color: '#a0a060' }}>
                  After payment, take a screenshot of the payment confirmation and upload it below. Your registration will be confirmed after admin verification.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit}>
          <div
            className="p-6 rounded-xl mb-6"
            style={{ background: '#12121a', border: '1px solid #2a2a3a' }}
          >
            <h2 className="font-orbitron font-700 text-base mb-4" style={{ color: '#e8e8f0' }}>
              Upload Payment Screenshot
            </h2>

            <label className="block w-full cursor-pointer" htmlFor="screenshot-upload">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
                style={{
                  borderColor: screenshotPreview ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 107, 0, 0.3)',
                  background: screenshotPreview ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 107, 0, 0.03)',
                }}
              >
                {screenshotPreview ? (
                  <div>
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot"
                      className="max-h-48 mx-auto rounded-lg mb-3 object-contain"
                    />
                    <p className="font-rajdhani text-sm" style={{ color: '#22c55e' }}>
                      ✓ {screenshot?.name}
                    </p>
                    <p className="font-rajdhani text-xs mt-1" style={{ color: '#6b6b88' }}>
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: '#ff6b00' }} />
                    <p className="font-rajdhani font-600 text-sm mb-1" style={{ color: '#e8e8f0' }}>
                      Click to upload payment screenshot
                    </p>
                    <p className="font-rajdhani text-xs" style={{ color: '#6b6b88' }}>
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </label>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="submit"
            disabled={!screenshot || isSubmitting}
            className="neon-btn-orange w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2"
            style={{
              opacity: !screenshot || isSubmitting ? 0.5 : 1,
              cursor: !screenshot ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Payment Proof
              </>
            )}
          </button>

          {!screenshot && (
            <p className="text-center text-xs mt-2" style={{ color: '#6b6b88' }}>
              Please upload your payment screenshot to continue
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
