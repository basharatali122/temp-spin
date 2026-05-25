import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../hooks/useGame';
import { LayoutDashboard, Bot, LogOut, Wifi, WifiOff, ChevronRight, ChevronDown } from 'lucide-react';

const PROFILE = 'Profile_1';

// Convert #rrggbb → "r,g,b" for rgba() usage
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

export default function Layout({ children, title }) {
  const { user, logout }           = useAuth();
  const navigate                   = useNavigate();
  const location                   = useLocation();
  const { connected }              = useSocket();
  const { game, games, setGame }   = useGame();
  const [dropdownOpen, setDropdown] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',              path: '/' },
    { icon: Bot,             label: PROFILE.replace('_', ' '), path: `/profile/${PROFILE}` },
  ];

  const rgb = hexToRgb(game.color);

  return (
    <div className="layout-root">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Logo — updates to show active game name */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{game.emoji}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', color: game.color }}>
              {game.label}
            </div>
            <div style={{
              fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              letterSpacing: 1.5, textTransform: 'uppercase',
            }}>Wheel Claimer</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 2,
            color: 'var(--text-muted)', textTransform: 'uppercase',
            padding: '6px 12px 8px',
          }}>Navigation</div>

          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <item.icon size={14} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={11} />}
              </Link>
            );
          })}

          {/* ── Game Server Selector ──────────────────────────────────── */}
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 2,
            color: 'var(--text-muted)', textTransform: 'uppercase',
            padding: '14px 12px 6px',
          }}>Game Server</div>

          {/* Dropdown trigger */}
          <div
            onClick={() => setDropdown(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid rgba(${rgb},0.35)`,
              background: `rgba(${rgb},0.08)`,
              transition: 'all 0.12s', marginBottom: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.15)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.08)`}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{game.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {game.label}
            </span>
            <ChevronDown size={12} style={{
              color: 'var(--text-muted)', flexShrink: 0,
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
            }} />
          </div>

          {/* Dropdown list */}
          {dropdownOpen && (
            <div style={{
              margin: '2px 0 6px', border: '1px solid var(--border)',
              borderRadius: 6, overflow: 'hidden', background: 'var(--bg-raised)',
            }}>
              {games.map(g => {
                const gr = hexToRgb(g.color);
                const active = g.id === game.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => { setGame(g.id); setDropdown(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 12px', cursor: 'pointer',
                      borderLeft: `2px solid ${active ? g.color : 'transparent'}`,
                      background: active ? `rgba(${gr},0.10)` : 'transparent',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 13 }}>{g.emoji}</span>
                    <span style={{ fontSize: 12, flex: 1,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 700 : 400,
                    }}>{g.label}</span>
                    {g.noWeekendSpin && (
                      <span style={{
                        fontSize: 7, fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)', letterSpacing: 0.5,
                        background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3,
                      }}>1-SPIN</span>
                    )}
                    {active && (
                      <span style={{
                        fontSize: 8, fontFamily: 'var(--font-mono)',
                        color: g.color, letterSpacing: 1,
                      }}>ACTIVE</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          {/* Connection */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 12px', marginBottom: 4,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: connected ? 'var(--success)' : 'var(--text-muted)',
          }}>
            {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>

          {/* Active game badge in footer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', marginBottom: 4,
            background: `rgba(${rgb},0.08)`,
            borderRadius: 4,
          }}>
            <span style={{ fontSize: 10 }}>{game.emoji}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: game.color, letterSpacing: 1 }}>
              {game.shortLabel} · {game.LOGIN_WS_URL.replace(/wss?:\/\//, '').split('/')[0].split(':')[0]}
            </span>
          </div>

          {/* User row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: game.color, flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, color: 'var(--text-primary)', fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email?.split('@')[0]}
              </div>
            </div>
            <button onClick={handleLogout} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, display: 'flex',
              borderRadius: 4, transition: 'color 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="main-content">
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', flex: 1 }}>{title}</h2>
          {/* Active game pill in topbar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            border: `1px solid rgba(${rgb},0.35)`,
            background: `rgba(${rgb},0.08)`,
            fontSize: 10, fontFamily: 'var(--font-mono)', color: game.color,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: game.color, display: 'inline-block' }} />
            {game.shortLabel}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
