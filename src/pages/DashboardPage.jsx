import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { processingAPI, statsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { USER_PROFILE } from '../App';
import { useGame } from '../hooks/useGame';
import { Bot, Zap, Target, TrendingUp, ArrowRight, Activity } from 'lucide-react';

export default function DashboardPage() {
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const { game }        = useGame();
  const [status, setStatus] = useState({ running: false });
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [statusRes, statsRes] = await Promise.allSettled([
      processingAPI.status(USER_PROFILE),
      statsAPI.get(USER_PROFILE),
    ]);
    if (statusRes.status === 'fulfilled') setStatus(statusRes.value.data || { running: false });
    if (statsRes.status  === 'fulfilled') setStats(statsRes.value.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  const running       = status.running;
  const processed     = stats?.totals?.totalProcessed   || 0;
  const wins          = stats?.totals?.totalWins         || 0;
  const regularSpins  = stats?.totals?.totalRegularSpins || 0;
  const weekendSpins  = stats?.totals?.totalWeekendSpins || 0;
  const totalScore    = stats?.totals?.totalScoreWon     || 0;
  const winRate       = processed > 0 ? ((wins / processed) * 100).toFixed(1) : null;

  const wheelModeLabel = status.wheelMode === 'double' ? 'Weekend Wheel' : 'Daily Wheel';
  const wheelModeColor = status.wheelMode === 'double' ? 'var(--double-color)' : 'var(--single-color)';

  const statCards = [
    { label: 'Bot Status',    value: running ? 'ACTIVE' : 'IDLE',         accent: running ? 'accent' : '', icon: Bot },
    { label: 'Total Spins',   value: (regularSpins + weekendSpins).toLocaleString(), accent: 'amber', icon: Target },
    { label: 'Score Won',     value: totalScore.toLocaleString(),          accent: 'accent', icon: TrendingUp },
    { label: 'Success Rate',  value: winRate ? `${winRate}%` : '—',       accent: '', icon: Zap },
  ];

  return (
    <Layout title="Dashboard">
      <div style={{ maxWidth: 860 }}>

        {/* Session banner */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
        }}>
          <div style={{
            flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md, 8px)', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
            color: 'var(--text-secondary)', minWidth: 200,
          }}>
            <Activity size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>Session: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong></span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              {running ? '● running' : '○ idle'}
            </span>
          </div>

          {/* Active game pill — always visible */}
          <div style={{
            background: 'var(--bg-surface)', border: `1px solid ${game.color}40`,
            borderRadius: 8, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
          }}>
            <span style={{ fontSize: 14 }}>{game.emoji}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Game:</span>
            <strong style={{ color: game.color }}>{game.label}</strong>
          </div>

          {running && (
            <div style={{
              background: 'var(--bg-surface)', border: `1px solid ${wheelModeColor}40`,
              borderRadius: 8, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: wheelModeColor, flexShrink: 0, boxShadow: `0 0 8px ${wheelModeColor}` }} />
              <span style={{ color: 'var(--text-secondary)' }}>Mode:</span>
              <strong style={{ color: wheelModeColor }}>{wheelModeLabel}</strong>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
          {statCards.map(card => (
            <div key={card.label} className="stat-card">
              <div className="stat-label">{card.label}</div>
              <div className={`stat-value ${card.accent}`} style={{ fontSize: 18 }}>
                {loading ? '—' : card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Wheel breakdown */}
        {(regularSpins > 0 || weekendSpins > 0) && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22,
          }}>
            <div style={{
              background: 'var(--single-glow)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 'var(--radius-lg)', padding: '14px 18px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--single-color)', textTransform: 'uppercase', marginBottom: 6 }}>
                ☀ Daily Wheel (Single Spin)
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--single-color)' }}>
                {regularSpins.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>total regular wheel spins</div>
            </div>
            <div style={{
              background: 'var(--double-glow)', border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: 'var(--radius-lg)', padding: '14px 18px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--double-color)', textTransform: 'uppercase', marginBottom: 6 }}>
                ✦ Weekend Wheel (Double Spin)
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--double-color)' }}>
                {weekendSpins.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>total weekend wheel spins</div>
            </div>
          </div>
        )}

        {/* Profile card */}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
          Your Profile
        </div>

        <div
          onClick={() => navigate(`/profile/${USER_PROFILE}`)}
          style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${running ? 'rgba(255,107,26,0.35)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: running ? '0 0 24px rgba(255,107,26,0.08)' : 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = running ? 'rgba(255,107,26,0.55)' : 'var(--border-lit)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = running ? 'rgba(255,107,26,0.35)' : 'var(--border)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`dot ${running ? 'dot-orange dot-pulse' : 'dot-grey'}`} />
              <span style={{ fontWeight: 800, fontSize: 15 }}>{USER_PROFILE.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${running ? 'badge-orange' : 'badge-muted'}`}>
                {running ? '● RUNNING' : '○ IDLE'}
              </span>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { label: 'Processed',     value: processed.toLocaleString() },
              { label: 'Regular Spins', value: regularSpins.toLocaleString() },
              { label: 'Weekend Spins', value: weekendSpins.toLocaleString() },
              { label: 'Score Won',     value: totalScore.toLocaleString() },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}>
                <div style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15 }}>{loading ? '—' : s.value}</div>
              </div>
            ))}
          </div>

          {running && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                <span>Cycle {status.currentCycle || 0}/{status.totalCycles || 0}</span>
                <span style={{ color: wheelModeColor }}>{wheelModeLabel}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${status.wheelMode === 'double' ? 'violet' : 'amber'}`} style={{
                  width: `${((status.currentCycle || 0) / Math.max(status.totalCycles || 1, 1)) * 100}%`
                }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
            Click to open bot controls, manage accounts, configure proxy →
          </div>
        </div>
      </div>
    </Layout>
  );
}
