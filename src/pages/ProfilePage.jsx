




// import { useState, useEffect, useRef, useCallback, memo } from 'react';
// import { useParams } from 'react-router-dom';
// import Layout from '../components/Layout';
// import { useBotEvents } from '../hooks/useSocket';
// import { accountsAPI, processingAPI, proxyAPI, statsAPI } from '../services/api';
// import { useGame } from '../hooks/useGame';
// import {
//   Play, Square, Upload, Trash2, RefreshCw, Shield,
//   BarChart3, Terminal, Users, Plus, ChevronDown,
// } from 'lucide-react';

// // ─── Terminal ──────────────────────────────────────────────────────────────────
// const BotTerminal = memo(function BotTerminal({ logs }) {
//   const endRef       = useRef(null);
//   const containerRef = useRef(null);
//   const [autoScroll, setAutoScroll] = useState(true);

//   useEffect(() => {
//     if (autoScroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [logs, autoScroll]);

//   const handleScroll = () => {
//     const el = containerRef.current;
//     if (!el) return;
//     setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
//   };

//   const typeColor = {
//     success: 'terminal-success', error: 'terminal-error',
//     warning: 'terminal-warning', debug: 'terminal-debug', info: 'terminal-info',
//   };

//   return (
//     <div className="terminal" ref={containerRef} onScroll={handleScroll}>
//       {logs.length === 0 && (
//         <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
//           Waiting for bot output...
//         </div>
//       )}
//       {logs.map((log, i) => (
//         <div key={i} className="terminal-line">
//           <span className="terminal-time">
//             {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
//           </span>
//           <span className={typeColor[log.type] || 'terminal-info'}>{log.message}</span>
//         </div>
//       ))}
//       <div ref={endRef} />
//     </div>
//   );
// });

// // ─── Wheel Mode Selector ───────────────────────────────────────────────────────
// function WheelModeSelector({ value, onChange, disabled, game }) {
//   const modes = [
//     {
//       id: 'single',
//       icon: '☀️',
//       title: 'Single Spin',
//       sub: 'Daily Wheel',
//       desc: 'Spins the regular daily wheel for each account. Fast, one spin per account.',
//       pills: ['Regular Wheel', 'Daily Reward', 'subID:16'],
//       color: 'var(--single-color)',
//     },
//     {
//       id: 'double',
//       icon: '✨',
//       title: 'Double Spin',
//       sub: 'Weekend Wheel',
//       desc: game?.noWeekendSpin
//         ? `${game.label} does not have a weekend wheel. Only Single Spin is available.`
//         : 'Spins both regular + weekend wheel per account. Maximum rewards, multi-cycle.',
//       pills: game?.noWeekendSpin
//         ? ['Not Available', 'No Weekend Wheel']
//         : ['Regular + Weekend', 'Max Rewards', 'subID:16+27'],
//       color: 'var(--double-color)',
//       locked: !!game?.noWeekendSpin,
//     },
//   ];

//   return (
//     <div>
//       <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
//         Select Spin Mode
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//         {modes.map(mode => {
//           const selected = value === mode.id;
//           const isLocked   = mode.locked;
//           const isDisabled = disabled || isLocked;
//           const cls = `mode-card ${selected && !isLocked ? `selected-${mode.id}` : ''}`;
//           return (
//             <div
//               key={mode.id}
//               className={cls}
//               onClick={() => !isDisabled && onChange(mode.id)}
//               style={{
//                 opacity: isDisabled ? 0.5 : 1,
//                 cursor:  isDisabled ? 'not-allowed' : 'pointer',
//                 position: 'relative',
//               }}
//             >
//               <span className="mode-icon">{mode.icon}</span>
//               <div className="mode-title" style={{ color: selected ? mode.color : 'var(--text-primary)' }}>
//                 {mode.title}
//               </div>
//               <div className="mode-sub">{mode.sub}</div>
//               <div style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '8px 0', lineHeight: 1.5 }}>
//                 {mode.desc}
//               </div>
//               <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
//                 {mode.pills.map(p => (
//                   <span key={p} className="mode-badge">{p}</span>
//                 ))}
//               </div>
//               {selected && (
//                 <div style={{
//                   position: 'absolute', top: 10, right: 10,
//                   width: 18, height: 18, borderRadius: '50%',
//                   background: mode.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 11, color: '#050508', fontWeight: 800,
//                 }}>✓</div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─── Proxy Panel ───────────────────────────────────────────────────────────────
// function ProxyPanel({ profile }) {
//   const [config, setConfig]     = useState({ enabled: false, proxyList: [] });
//   const [proxyText, setText]    = useState('');
//   const [status, setStatus]     = useState('');
//   const [statusOk, setStatusOk] = useState(true);
//   const [testing, setTesting]   = useState(false);
//   const [saving, setSaving]     = useState(false);
//   const [normalizing, setNorm]  = useState(false);

//   useEffect(() => {
//     proxyAPI.get(profile).then(r => {
//       const cfg = r.data.config || {};
//       setConfig(cfg);
//       const list = Array.isArray(cfg.proxyList) ? cfg.proxyList : [];
//       setText(list.join('\n'));
//     }).catch(() => {});
//   }, [profile]);

//   const showStatus = (msg, ok = true) => { setStatus(msg); setStatusOk(ok); };

//   // Auto-normalize all lines via backend (handles every format)
//   const handleNormalize = async () => {
//     setNorm(true);
//     try {
//       const r = await proxyAPI.normalize(profile, proxyText);
//       if (r.data.success) {
//         setText(r.data.normalized.join('\n'));
//         showStatus(`✅ Normalized ${r.data.count} proxies — all converted to socks5h:// format`, true);
//       }
//     } catch { showStatus('❌ Normalize failed', false); }
//     setNorm(false);
//   };

//   const handleTest = async () => {
//     // Test first line (or first non-empty line)
//     const firstLine = proxyText.split('\n').map(l => l.trim()).find(l => l.length > 0);
//     if (!firstLine) { showStatus('⚠️ No proxy to test — paste at least one proxy', false); return; }
//     setTesting(true);
//     showStatus('⏳ Testing live connection through proxy...', true);
//     try {
//       const r = await proxyAPI.test(profile, firstLine);
//       showStatus(r.data.message, r.data.success);
//     } catch { showStatus('❌ Test request failed', false); }
//     setTesting(false);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     const lines = proxyText.split('\n').filter(l => l.trim());
//     try {
//       const r = await proxyAPI.save(profile, { ...config, proxyList: lines });
//       showStatus(`✅ Saved ${r.data.saved} proxies`, true);
//     } catch { showStatus('❌ Save failed', false); }
//     setSaving(false);
//   };

//   return (
//     <div>
//       <label className="checkbox-label" style={{ marginBottom: 16 }}>
//         <input type="checkbox" checked={config.enabled}
//           onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} />
//         Enable proxy for this profile
//       </label>

//       {config.enabled && (
//         <>
//           <div className="form-group">
//             <label className="form-label">
//               Proxy List
//               <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>
//                 — all formats accepted, one per line
//               </span>
//             </label>

//             {/* Format hints */}
//             <div style={{
//               background: 'var(--bg-raised)', borderRadius: 4, padding: '8px 10px',
//               marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10,
//               color: 'var(--text-muted)', lineHeight: 1.7,
//             }}>
//               <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>Accepted formats:</div>
//               <div>socks5h://user:pass@host:port</div>
//               <div>socks5://user:pass@host:port</div>
//               <div>socks4://user:pass@host:port</div>
//               <div>http://user:pass@host:port</div>
//               <div>user:pass@host:port <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
//               <div>host:port:user:pass <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
//               <div>user__cr.us:pass@host:port <span style={{ color: 'var(--accent)', fontSize: 9 }}>← DataImpulse geo format</span></div>
//             </div>

//             <textarea
//               className="textarea"
//               rows={8}
//               placeholder={
//                 'Paste proxies here — one per line\n\n' +
//                 'Examples:\n' +
//                 'socks5h://user:pass@45.39.25.184:5619\n' +
//                 'user:pass@gw.dataimpulse.com:10037\n' +
//                 'user__cr.us:pass@74.81.81.81:10000\n' +
//                 '45.39.25.184:5619:user:pass'
//               }
//               value={proxyText}
//               onChange={e => setText(e.target.value)}
//               style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
//             />
//           </div>

//           <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
//             <button className="btn btn-warning btn-sm" onClick={handleNormalize} disabled={normalizing}>
//               {normalizing ? '...' : '⇄ Normalize'}
//             </button>
//             <button className="btn btn-ghost btn-sm" onClick={handleTest} disabled={testing}>
//               {testing ? '...' : '⚡ Test First'}
//             </button>
//             <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
//               {saving ? '...' : '↑ Save'}
//             </button>
//           </div>

//           <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
//             💡 Click <strong>Normalize</strong> to auto-convert all raw formats before saving.
//             Click <strong>Test First</strong> to verify the first proxy makes a live connection.
//           </div>
//         </>
//       )}

//       {/* Status badge */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
//         <div style={{
//           width: 7, height: 7, borderRadius: '50%',
//           background: config.enabled ? 'var(--success)' : 'var(--text-muted)',
//         }} />
//         <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
//           {config.enabled
//             ? `Proxy active — ${Array.isArray(config.proxyList) ? config.proxyList.length : 0} proxies`
//             : 'No proxy — direct connection'}
//         </span>
//       </div>

//       {status && (
//         <div style={{
//           marginTop: 10, padding: '7px 10px', borderRadius: 4,
//           background: 'var(--bg-raised)',
//           fontFamily: 'var(--font-mono)', fontSize: 11,
//           color: statusOk ? 'var(--success)' : 'var(--danger)',
//           whiteSpace: 'pre-wrap', wordBreak: 'break-word',
//         }}>{status}</div>
//       )}
//     </div>
//   );
// }

// // ─── Accounts Table ────────────────────────────────────────────────────────────
// function AccountsTable({ profile }) {
//   const [accounts, setAccounts]     = useState([]);
//   const [loading, setLoading]       = useState(true);
//   const [selected, setSelected]     = useState(new Set());
//   const [showGenerate, setShowGen]  = useState(false);
//   const [showImport, setShowImport] = useState(false);
//   const [importText, setImportText] = useState('');
//   const [status, setStatus]         = useState('');
//   const [statusType, setStatusType] = useState('info');

//   const [genUsername, setGenUser]   = useState('');
//   const [genStart, setGenStart]     = useState(1);
//   const [genEnd, setGenEnd]         = useState(100);
//   const [genPass, setGenPass]       = useState('');
//   const [generating, setGenerating] = useState(false);

//   const setMsg = (msg, type = 'info') => { setStatus(msg); setStatusType(type); };

//   const load = useCallback(async () => {
//     setLoading(true);
//     try { const r = await accountsAPI.getAll(profile); setAccounts(r.data.accounts || []); }
//     catch { setMsg('Failed to load accounts', 'error'); }
//     setLoading(false);
//   }, [profile]);

//   useEffect(() => { load(); }, [load]);

//   const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
//   const toggleAll    = ()   => setSelected(s => s.size === accounts.length ? new Set() : new Set(accounts.map(a => a.id)));

//   const handleDeleteSelected = async () => {
//     if (!selected.size) return;
//     if (!confirm(`Delete ${selected.size} accounts?`)) return;
//     try { await accountsAPI.bulkDelete(profile, [...selected]); setSelected(new Set()); setMsg(`✅ Deleted ${selected.size}`, 'success'); await load(); }
//     catch { setMsg('❌ Delete failed', 'error'); }
//   };
//   const handleClearAll = async () => {
//     if (!confirm(`Clear ALL ${accounts.length} accounts? Cannot be undone.`)) return;
//     try { await accountsAPI.clearAll(profile); setSelected(new Set()); setMsg('✅ All cleared', 'success'); await load(); }
//     catch { setMsg('❌ Clear failed', 'error'); }
//   };
//   const handleImport = async () => {
//     const parsed = importText.trim().split('\n').map(l => {
//       const [u, pw] = l.trim().split(':');
//       return u && pw ? { username: u.trim(), password: pw.trim() } : null;
//     }).filter(Boolean);
//     if (!parsed.length) { setMsg('⚠️ No valid lines (format: user:pass)', 'error'); return; }
//     try {
//       const r = await accountsAPI.bulkImport(profile, parsed);
//       setImportText(''); setShowImport(false);
//       setMsg(`✅ Added ${r.data.added} | Skipped ${r.data.duplicates} duplicates`, 'success');
//       await load();
//     } catch { setMsg('❌ Import failed', 'error'); }
//   };
//   const handleGenerate = async () => {
//     if (!genUsername.trim()) { setMsg('⚠️ Username required', 'error'); return; }
//     if (genStart > genEnd) { setMsg('⚠️ Start must be ≤ End', 'error'); return; }
//     const count = genEnd - genStart + 1;
//     if (count > 5000) { setMsg('⚠️ Max 5000 per generation', 'error'); return; }
//     setGenerating(true); setMsg(`Generating ${count}...`);
//     try {
//       const r = await accountsAPI.generate(profile, { username: genUsername.trim(), startRange: genStart, endRange: genEnd, password: genPass.trim() || 'password123' });
//       setMsg(`✅ Generated ${r.data.generated} | Added ${r.data.added} | Skipped ${r.data.duplicates}`, 'success');
//       setShowGen(false); await load();
//     } catch (e) { setMsg(`❌ ${e.message}`, 'error'); }
//     setGenerating(false);
//   };

//   const previewName = genUsername
//     ? `${genUsername}${String(genStart).padStart(String(genEnd).length, '0')} … ${genUsername}${genEnd}`
//     : '';

//   return (
//     <div>
//       {/* Toolbar */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
//         <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
//           {accounts.length.toLocaleString()} accounts{selected.size > 0 && ` · ${selected.size} selected`}
//         </span>
//         <div style={{ flex: 1 }} />
//         {selected.size > 0 && <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}><Trash2 size={11} /> Delete ({selected.size})</button>}
//         <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}><RefreshCw size={11} className={loading ? 'spin' : ''} /></button>
//         <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(v => !v)}><Upload size={11} /> Import</button>
//         <button className="btn btn-primary btn-sm" onClick={() => setShowGen(v => !v)}><Plus size={11} /> Generate</button>
//         {accounts.length > 0 && <button className="btn btn-danger btn-sm" onClick={handleClearAll}><Trash2 size={11} /> Clear All</button>}
//       </div>

//       {status && (
//         <div style={{
//           padding: '6px 10px', marginBottom: 10, borderRadius: 'var(--radius-sm)',
//           background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 11,
//           color: statusType === 'success' ? 'var(--success)' : statusType === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
//         }}>{status}</div>
//       )}

//       {/* Generate panel */}
//       {showGenerate && (
//         <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
//           <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase' }}>⚡ Generate Accounts</div>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
//             <div className="form-group" style={{ margin: 0 }}>
//               <label className="form-label">Username Base *</label>
//               <input className="input" placeholder="e.g. player, user" value={genUsername} onChange={e => setGenUser(e.target.value)} />
//             </div>
//             <div className="form-group" style={{ margin: 0 }}>
//               <label className="form-label">Password</label>
//               <input className="input" placeholder="password123 (default)" value={genPass} onChange={e => setGenPass(e.target.value)} />
//             </div>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
//             <div className="form-group" style={{ margin: 0 }}>
//               <label className="form-label">Start Range</label>
//               <input className="input" type="number" min={1} value={genStart} onChange={e => setGenStart(parseInt(e.target.value) || 1)} />
//             </div>
//             <div className="form-group" style={{ margin: 0 }}>
//               <label className="form-label">End Range</label>
//               <input className="input" type="number" min={genStart} value={genEnd} onChange={e => setGenEnd(parseInt(e.target.value) || 100)} />
//             </div>
//           </div>
//           {genUsername && (
//             <div style={{ padding: '6px 10px', background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
//               <span style={{ color: 'var(--text-muted)' }}>Preview: </span>
//               <span style={{ color: 'var(--accent)' }}>{previewName}</span>
//               <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({Math.max(0, genEnd - genStart + 1).toLocaleString()} accounts)</span>
//             </div>
//           )}
//           <div style={{ display: 'flex', gap: 8 }}>
//             <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
//               {generating ? 'Generating...' : `⚡ Generate ${(genEnd - genStart + 1).toLocaleString()}`}
//             </button>
//             <button className="btn btn-ghost btn-sm" onClick={() => setShowGen(false)}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {/* Import panel */}
//       {showImport && (
//         <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
//           <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--text-primary)', marginBottom: 10, textTransform: 'uppercase' }}>Bulk Import</div>
//           <label className="form-label">Format: username:password (one per line)</label>
//           <textarea className="textarea" rows={5} placeholder={"player001:pass123\nplayer002:pass456"} value={importText} onChange={e => setImportText(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
//           <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
//             <button className="btn btn-primary btn-sm" onClick={handleImport}>↑ Import</button>
//             <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(false)}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
//         <table>
//           <thead>
//             <tr>
//               <th style={{ width: 32 }}>
//                 <input type="checkbox" onChange={toggleAll} checked={selected.size === accounts.length && accounts.length > 0} />
//               </th>
//               <th>Username</th>
//               <th>Score</th>
//               <th>Last Processed</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Loading...</td></tr>
//             ) : accounts.length === 0 ? (
//               <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No accounts yet — use Generate or Import above</td></tr>
//             ) : accounts.slice(0, 300).map(a => (
//               <tr key={a.id} style={{ background: selected.has(a.id) ? 'rgba(255,107,26,0.04)' : undefined }}>
//                 <td><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
//                 <td style={{ fontFamily: 'var(--font-mono)' }}>{a.username}</td>
//                 <td style={{ color: 'var(--accent)' }}>{a.score || 0}</td>
//                 <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{a.last_processed ? new Date(a.last_processed).toLocaleString() : '—'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {accounts.length > 300 && (
//           <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
//             Showing first 300 of {accounts.length.toLocaleString()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Stats Panel ───────────────────────────────────────────────────────────────
// function StatsPanel({ profile, liveStats }) {
//   const [stats, setStats] = useState(null);

//   useEffect(() => {
//     const fetch = () => statsAPI.get(profile).then(r => setStats(r.data)).catch(() => {});
//     fetch();
//     // Poll every 30 s — matches the status poll cadence to keep
//     // total server load within bounds for 200 concurrent users.
//     const iv = setInterval(fetch, 30000);
//     return () => clearInterval(iv);
//   }, [profile]);

//   const t    = stats?.totals || {};
//   const live = liveStats || {};

//   return (
//     <div>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
//         {[
//           { label: 'Total Processed',   value: (t.totalProcessed   || 0).toLocaleString() },
//           { label: 'Total Wins',        value: (t.totalWins        || 0).toLocaleString(), accent: 'accent' },
//           { label: 'Regular Wheel Spins', value: (t.totalRegularSpins || 0).toLocaleString(), accent: 'amber' },
//           { label: 'Weekend Wheel Spins', value: (t.totalWeekendSpins || 0).toLocaleString(), accent: 'violet' },
//           { label: 'Total Score Won',   value: (t.totalScoreWon    || 0).toLocaleString(), accent: 'accent' },
//           { label: 'Sessions',          value: (t.totalSessions    || 0).toString() },
//         ].map(s => (
//           <div key={s.label} style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
//             <div className="stat-label" style={{ fontSize: 8 }}>{s.label}</div>
//             <div className={`stat-value ${s.accent || ''}`} style={{ fontSize: 20 }}>{s.value}</div>
//           </div>
//         ))}
//       </div>

//       {live.isRunning && (
//         <div style={{ padding: 12, background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 'var(--radius)' }}>
//           <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase' }}>● Live Session</div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
//             {[
//               { label: 'Success',  value: live.successCount || 0 },
//               { label: 'Failed',   value: live.failCount    || 0 },
//               { label: 'IP Banned', value: live.ipBanned     || 0 },
//               { label: 'Workers',  value: live.activeWorkers || 0 },
//             ].map(s => (
//               <div key={s.label}>
//                 <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
//                 <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }}>{s.value}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main ProfilePage ──────────────────────────────────────────────────────────
// export default function ProfilePage() {
//   const { profileName } = useParams();

//   // ── State ──────────────────────────────────────────────────────────────────
//   const { game } = useGame();
//   const [tab, setTab]           = useState('terminal');
//   const [logs, setLogs]         = useState([]);
//   const [botStatus, setBotStatus] = useState({ running: false });
//   const [liveStats, setLiveStats] = useState(null);
//   const [starting, setStarting]   = useState(false);

//   // ── Game mode selection ────────────────────────────────────────────────────
//   // Persisted per-profile so user's choice survives page reload
//   const storageKey = `_fk_mode_${profileName}`;
//   const [wheelMode, setWheelMode] = useState(
//     () => localStorage.getItem(storageKey) || 'single'
//   );
//   const [repetitions, setReps] = useState(1);

//   const handleModeChange = (mode) => {
//     if (botStatus.running) return; // can't change while running
//     setWheelMode(mode);
//     localStorage.setItem(storageKey, mode);
//   };

//   // ── Socket events ──────────────────────────────────────────────────────────
//   const handleEvent = useCallback((event, data) => {
//     if (event === 'bot:terminal') {
//       setLogs(prev => [...prev.slice(-600), data]);
//     } else if (event === 'bot:status') {
//       setBotStatus(data);
//       if (data.running) setLiveStats(data);
//     } else if (event === 'bot:completed') {
//       setBotStatus(s => ({ ...s, running: false }));
//       setLiveStats(null);
//     } else if (event === 'bot:wheelStats') {
//       setLiveStats(prev => prev ? { ...prev, ...data } : data);
//     } else if (event === 'bot:cycleUpdate') {
//       setBotStatus(s => ({ ...s, currentCycle: data.cyclesCompleted, totalCycles: data.totalCycles }));
//     }
//   }, []);

//   useBotEvents(profileName, handleEvent);

//   // ── Poll status ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const poll = async () => {
//       try {
//         const r = await processingAPI.status(profileName);
//         setBotStatus(r.data);
//         if (r.data.wheelMode) {
//           setWheelMode(r.data.wheelMode);
//           localStorage.setItem(storageKey, r.data.wheelMode);
//         }
//       } catch (_) {}
//     };
//     poll();
//     // Poll every 30 s — Socket.IO pushes real-time updates so this is
//     // only a fallback sync. 10 s × 200 users = 1200 req/min which
//     // saturates the server; 30 s keeps it at ~400 req/min.
//     const iv = setInterval(poll, 30000);
//     return () => clearInterval(iv);
//   }, [profileName, storageKey]);

//   // ── Start/Stop ─────────────────────────────────────────────────────────────
//   const handleStart = async () => {
//     setStarting(true);
//     try {
//       // If game has no weekend wheel, always force single mode
//       const effectiveMode = game.noWeekendSpin ? 'single' : wheelMode;

//       // Send game server config so backend connects to the right WS URL.
//       // ORIGIN is critical — wrong origin causes server to reject login.
//       const gameConfig = {
//         id:            game.id,
//         LOGIN_WS_URL:  game.LOGIN_WS_URL,
//         GAME_VERSION:  game.GAME_VERSION,
//         ORIGIN:        game.ORIGIN,
//         noWeekendSpin: !!game.noWeekendSpin,
//       };

//       await processingAPI.start(profileName, {
//         workers:     game.workers || 20,
//         wheelMode:   effectiveMode,
//         repetitions: effectiveMode === 'double' ? repetitions : 1,
//         gameConfig,
//       });
//       setBotStatus(s => ({ ...s, running: true, wheelMode }));
//       setLogs([]);
//       setTab('terminal');
//     } catch (e) {
//       setLogs(prev => [...prev, {
//         type: 'error',
//         message: `Failed to start: ${e.response?.data?.error || e.message}`,
//         timestamp: new Date().toISOString(),
//       }]);
//     }
//     setStarting(false);
//   };

//   const handleStop = async () => {
//     try {
//       await processingAPI.stop(profileName);
//       setBotStatus(s => ({ ...s, running: false }));
//     } catch (_) {}
//   };

//   // ── Derived values ─────────────────────────────────────────────────────────
//   const running         = botStatus.running;
//   const modeColor       = wheelMode === 'double' ? 'var(--double-color)' : 'var(--single-color)';
//   const modeLabel       = wheelMode === 'double' ? 'Double Spin – Weekend Wheel' : 'Single Spin – Daily Wheel';
//   const progressClass   = wheelMode === 'double' ? 'violet' : 'amber';
//   const cycleProgress   = botStatus.totalCycles > 0
//     ? ((botStatus.currentCycle || 0) / botStatus.totalCycles) * 100
//     : 0;

//   const TABS = [
//     { id: 'terminal', label: 'Terminal',  icon: Terminal  },
//     { id: 'accounts', label: 'Accounts',  icon: Users     },
//     { id: 'stats',    label: 'Stats',     icon: BarChart3 },
//     { id: 'proxy',    label: 'Proxy',     icon: Shield    },
//   ];

//   return (
//     <Layout title={profileName.replace('_', ' ')}>
//       <div style={{ maxWidth: 1000 }}>

//         {/* ── Wheel Mode Selector ── */}
//         {!running && (
//           <div className="card" style={{ marginBottom: 16 }}>
//             <WheelModeSelector value={wheelMode} onChange={handleModeChange} disabled={running} game={game} />
//           </div>
//         )}

//         {/* ── Control Bar ── */}
//         <div className="card" style={{ marginBottom: 16 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

//             {/* Status dot */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <span className={`dot ${running ? 'dot-orange dot-pulse' : 'dot-grey'}`} />
//               <span style={{
//                 fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
//                 color: running ? 'var(--accent)' : 'var(--text-secondary)',
//               }}>
//                 {running ? 'RUNNING' : 'IDLE'}
//               </span>
//             </div>

//             <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

//             {/* Active mode badge */}
//             <div style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               background: `${modeColor}12`,
//               border: `1px solid ${modeColor}40`,
//               borderRadius: 20, padding: '3px 12px',
//             }}>
//               <span style={{ fontSize: 12 }}>{wheelMode === 'double' ? '✨' : '☀️'}</span>
//               <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: modeColor, fontWeight: 700 }}>
//                 {wheelMode === 'double' ? 'DOUBLE SPIN' : 'SINGLE SPIN'}
//               </span>
//             </div>
//             {/* Active game badge */}
//             <div style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               background: `${game.color}12`,
//               border: `1px solid ${game.color}40`,
//               borderRadius: 20, padding: '3px 12px',
//             }}>
//               <span style={{ fontSize: 12 }}>{game.emoji}</span>
//               <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: game.color, fontWeight: 700 }}>
//                 {game.shortLabel}
//               </span>
//             </div>

//             {/* Cycles — only for double spin */}
//             {wheelMode === 'double' && !running && (
//               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CYCLES</span>
//                 <input type="number" value={repetitions} min={1} max={50}
//                   onChange={e => setReps(parseInt(e.target.value) || 1)}
//                   style={{
//                     width: 60, padding: '5px 8px', background: 'var(--bg-raised)',
//                     border: '1px solid var(--border-lit)', borderRadius: 4,
//                     color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
//                     outline: 'none',
//                   }} />
//               </div>
//             )}

//             {running && botStatus.totalCycles > 1 && (
//               <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
//                 Cycle {botStatus.currentCycle}/{botStatus.totalCycles}
//               </div>
//             )}

//             <div style={{ flex: 1 }} />

//             {!running ? (
//               <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={starting}>
//                 <Play size={14} />
//                 {starting ? 'STARTING...' : `START ${wheelMode === 'double' ? 'DOUBLE' : 'SINGLE'} SPIN`}
//               </button>
//             ) : (
//               <button className="btn btn-danger" onClick={handleStop}>
//                 <Square size={13} />
//                 STOP BOT
//               </button>
//             )}
//           </div>

//           {/* Progress bar */}
//           {running && (
//             <div style={{ marginTop: 14 }}>
//               <div style={{
//                 display: 'flex', justifyContent: 'space-between',
//                 fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5,
//               }}>
//                 <span>{modeLabel}</span>
//                 {botStatus.totalCycles > 1 && <span>Cycle {botStatus.currentCycle || 0}/{botStatus.totalCycles}</span>}
//               </div>
//               <div className="progress-bar">
//                 <div className={`progress-fill ${progressClass}`} style={{ width: `${cycleProgress || 30}%` }} />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── Tabs ── */}
//         <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
//           <div className="tab-nav" style={{ background: 'var(--bg-raised)', padding: '0 8px' }}>
//             {TABS.map(t => (
//               <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
//                 <t.icon size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           <div style={{ padding: 20 }}>
//             {tab === 'terminal' && (
//               <div>
//                 <div className="card-header" style={{ marginBottom: 12 }}>
//                   <span className="card-title">Live Output</span>
//                   <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>Clear</button>
//                 </div>
//                 <BotTerminal logs={logs} />

//                 {/* Live stats strip */}
//                 {running && liveStats && (
//                   <div style={{
//                     display: 'flex', gap: 16, marginTop: 12,
//                     padding: '8px 12px', background: 'var(--bg-raised)',
//                     borderRadius: 'var(--radius-sm)',
//                     fontFamily: 'var(--font-mono)', fontSize: 11,
//                   }}>
//                     {[
//                       { label: 'Workers', value: liveStats.activeWorkers || liveStats.stats?.activeWorkers || 0 },
//                       { label: 'Success',  value: liveStats.successCount  || liveStats.stats?.successCount  || 0 },
//                       { label: 'Failed',   value: liveStats.failCount     || liveStats.stats?.failCount     || 0 },
//                       { label: 'IP Banned', value: liveStats.ipBanned || liveStats.stats?.ipBanned || 0, color: '#ef4444' },
//                       wheelMode === 'double' && { label: 'Regular', value: liveStats.regularWheelSpins || 0, color: 'var(--single-color)' },
//                       wheelMode === 'double' && { label: 'Weekend', value: liveStats.weekendWheelSpins || 0, color: 'var(--double-color)' },
//                       { label: 'Score Won', value: liveStats.totalScoreWon || 0, color: 'var(--accent)' },
//                     ].filter(Boolean).map(s => (
//                       <div key={s.label} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
//                         <span style={{ color: 'var(--text-muted)' }}>{s.label}:</span>
//                         <span style={{ fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//             {tab === 'accounts' && <AccountsTable profile={profileName} />}
//             {tab === 'stats'    && <StatsPanel profile={profileName} liveStats={liveStats} />}
//             {tab === 'proxy'    && <ProxyPanel profile={profileName} />}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }




//loveable version



import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBotEvents } from '../hooks/useSocket';
import { accountsAPI, processingAPI, proxyAPI, statsAPI } from '../services/api';
import { useGame } from '../hooks/useGame';
import {
  Play, Square, Upload, Trash2, RefreshCw, Shield,
  BarChart3, Terminal, Users, Plus, ChevronDown,
} from 'lucide-react';

// ─── Terminal ──────────────────────────────────────────────────────────────────
const BotTerminal = memo(function BotTerminal({ logs }) {
  const endRef       = useRef(null);
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, autoScroll]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
  };

  const typeColor = {
    success: 'terminal-success', error: 'terminal-error',
    warning: 'terminal-warning', debug: 'terminal-debug', info: 'terminal-info',
  };

  return (
    <div className="terminal" ref={containerRef} onScroll={handleScroll}>
      {logs.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          Waiting for bot output...
        </div>
      )}
      {logs.map((log, i) => (
        <div key={i} className="terminal-line">
          <span className="terminal-time">
            {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className={typeColor[log.type] || 'terminal-info'}>{log.message}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
});

// ─── Wheel Mode Selector ───────────────────────────────────────────────────────
function WheelModeSelector({ value, onChange, disabled, game }) {
  const modes = [
    {
      id: 'single',
      icon: '☀️',
      title: 'Single Spin',
      sub: 'Daily Wheel',
      desc: 'Spins the regular daily wheel for each account. Fast, one spin per account.',
      pills: ['Regular Wheel', 'Daily Reward', 'subID:16'],
      color: 'var(--single-color)',
    },
    {
      id: 'double',
      icon: '✨',
      title: 'Double Spin',
      sub: 'Weekend Wheel',
      desc: game?.noWeekendSpin
        ? `${game.label} does not have a weekend wheel. Only Single Spin is available.`
        : 'Spins both regular + weekend wheel per account. Maximum rewards, multi-cycle.',
      pills: game?.noWeekendSpin
        ? ['Not Available', 'No Weekend Wheel']
        : ['Regular + Weekend', 'Max Rewards', 'subID:16+27'],
      color: 'var(--double-color)',
      locked: !!game?.noWeekendSpin,
    },
  ];

  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
        Select Spin Mode
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {modes.map(mode => {
          const selected = value === mode.id;
          const isLocked   = mode.locked;
          const isDisabled = disabled || isLocked;
          const cls = `mode-card ${selected && !isLocked ? `selected-${mode.id}` : ''}`;
          return (
            <div
              key={mode.id}
              className={cls}
              onClick={() => !isDisabled && onChange(mode.id)}
              style={{
                opacity: isDisabled ? 0.5 : 1,
                cursor:  isDisabled ? 'not-allowed' : 'pointer',
                position: 'relative',
              }}
            >
              <span className="mode-icon">{mode.icon}</span>
              <div className="mode-title" style={{ color: selected ? mode.color : 'var(--text-primary)' }}>
                {mode.title}
              </div>
              <div className="mode-sub">{mode.sub}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '8px 0', lineHeight: 1.5 }}>
                {mode.desc}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {mode.pills.map(p => (
                  <span key={p} className="mode-badge">{p}</span>
                ))}
              </div>
              {selected && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 18, height: 18, borderRadius: '50%',
                  background: mode.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#050508', fontWeight: 800,
                }}>✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Proxy Panel ───────────────────────────────────────────────────────────────
function ProxyPanel({ profile }) {
  const [config, setConfig]     = useState({ enabled: false, proxyList: [] });
  const [proxyText, setText]    = useState('');
  const [status, setStatus]     = useState('');
  const [statusOk, setStatusOk] = useState(true);
  const [testing, setTesting]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [normalizing, setNorm]  = useState(false);
  const [validating, setValidating] = useState(false);
  const [vProgress, setVProgress]   = useState(null); // { done, total } | null

  useEffect(() => {
    proxyAPI.get(profile).then(r => {
      const cfg = r.data.config || {};
      setConfig(cfg);
      const list = Array.isArray(cfg.proxyList) ? cfg.proxyList : [];
      setText(list.join('\n'));
    }).catch(() => {});
  }, [profile]);

  const showStatus = (msg, ok = true) => { setStatus(msg); setStatusOk(ok); };

  // Auto-normalize all lines via backend (handles every format)
  const handleNormalize = async () => {
    setNorm(true);
    try {
      const r = await proxyAPI.normalize(profile, proxyText);
      if (r.data.success) {
        setText(r.data.normalized.join('\n'));
        showStatus(`✅ Normalized ${r.data.count} proxies — all converted to socks5h:// format`, true);
      }
    } catch { showStatus('❌ Normalize failed', false); }
    setNorm(false);
  };

  const handleTest = async () => {
    // Test first line (or first non-empty line)
    const firstLine = proxyText.split('\n').map(l => l.trim()).find(l => l.length > 0);
    if (!firstLine) { showStatus('⚠️ No proxy to test — paste at least one proxy', false); return; }
    setTesting(true);
    showStatus('⏳ Testing live connection through proxy...', true);
    try {
      const r = await proxyAPI.test(profile, firstLine);
      showStatus(r.data.message, r.data.success);
    } catch { showStatus('❌ Test request failed', false); }
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const lines = proxyText.split('\n').filter(l => l.trim());
    try {
      const r = await proxyAPI.save(profile, { ...config, proxyList: lines });
      showStatus(`✅ Saved ${r.data.saved} proxies`, true);
    } catch { showStatus('❌ Save failed', false); }
    setSaving(false);
  };

  // Bulk-test every proxy in the textarea, then auto-clean dead ones.
  const handleValidateAll = async () => {
    const lines = proxyText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) { showStatus('⚠️ No proxies to validate', false); return; }
    if (lines.length > 5 && !window.confirm(`Validate ${lines.length} proxies? This may take ${Math.ceil(lines.length / 25 * 12)}s. Dead proxies will be auto-removed from saved list.`)) return;

    setValidating(true);
    setVProgress({ done: 0, total: lines.length });
    showStatus(`⏳ Validating ${lines.length} proxies in parallel (this may take a moment)...`, true);

    try {
      const r = await proxyAPI.validateAll(profile, {
        proxyList: lines,
        concurrency: 25,
        autoClean: true,
      });
      const d = r.data;
      if (d.success) {
        // Update textarea with healthy-only list
        setText(d.healthy.join('\n'));
        const dead = d.dead || [];
        const sample = dead.slice(0, 3).map(x => `  • ${x.proxy} — ${x.reason}`).join('\n');
        showStatus(
          `${d.message}\n${dead.length > 0 ? '\nFirst dead proxies:\n' + sample : ''}`,
          d.healthyCount > 0
        );
      } else {
        showStatus(`❌ ${d.error || 'Validation failed'}`, false);
      }
    } catch (e) {
      showStatus(`❌ Validate request failed: ${e?.response?.data?.error || e.message}`, false);
    }
    setValidating(false);
    setVProgress(null);
  };

  return (
    <div>
      <label className="checkbox-label" style={{ marginBottom: 16 }}>
        <input type="checkbox" checked={config.enabled}
          onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} />
        Enable proxy for this profile
      </label>

      {config.enabled && (
        <>
          <div className="form-group">
            <label className="form-label">
              Proxy List
              <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>
                — all formats accepted, one per line
              </span>
            </label>

            {/* Format hints */}
            <div style={{
              background: 'var(--bg-raised)', borderRadius: 4, padding: '8px 10px',
              marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--text-muted)', lineHeight: 1.7,
            }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>Accepted formats:</div>
              <div>socks5h://user:pass@host:port</div>
              <div>socks5://user:pass@host:port</div>
              <div>socks4://user:pass@host:port</div>
              <div>http://user:pass@host:port</div>
              <div>user:pass@host:port <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
              <div>host:port:user:pass <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
              <div>user__cr.us:pass@host:port <span style={{ color: 'var(--accent)', fontSize: 9 }}>← DataImpulse geo format</span></div>
            </div>

            <textarea
              className="textarea"
              rows={8}
              placeholder={
                'Paste proxies here — one per line\n\n' +
                'Examples:\n' +
                'socks5h://user:pass@45.39.25.184:5619\n' +
                'user:pass@gw.dataimpulse.com:10037\n' +
                'user__cr.us:pass@74.81.81.81:10000\n' +
                '45.39.25.184:5619:user:pass'
              }
              value={proxyText}
              onChange={e => setText(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-warning btn-sm" onClick={handleNormalize} disabled={normalizing || validating}>
              {normalizing ? '...' : '⇄ Normalize'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleTest} disabled={testing || validating}>
              {testing ? '...' : '⚡ Test First'}
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onClick={handleValidateAll}
              disabled={validating}
              title="Test every proxy in parallel and remove dead ones"
            >
              {validating
                ? (vProgress ? `🧪 Testing ${vProgress.total}...` : '🧪 Testing...')
                : '🧪 Validate All & Auto-Clean'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || validating}>
              {saving ? '...' : '↑ Save'}
            </button>
          </div>

          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.6 }}>
            💡 <strong>Normalize</strong> = convert raw formats. <strong>Test First</strong> = quick check.
            <br />
            🧪 <strong>Validate All</strong> = test every proxy in parallel and auto-remove dead ones from the saved list.
            <br />
            🛡️ <strong>Auto pre-flight is ON</strong> — every time you click <em>Start</em>, the system silently re-validates all proxies and skips broken ones, so accounts never run on dead proxies.
          </div>
        </>
      )}

      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: config.enabled ? 'var(--success)' : 'var(--text-muted)',
        }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {config.enabled
            ? `Proxy active — ${Array.isArray(config.proxyList) ? config.proxyList.length : 0} proxies`
            : 'No proxy — direct connection'}
        </span>
      </div>

      {status && (
        <div style={{
          marginTop: 10, padding: '7px 10px', borderRadius: 4,
          background: 'var(--bg-raised)',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: statusOk ? 'var(--success)' : 'var(--danger)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>{status}</div>
      )}
    </div>
  );
}

// ─── Accounts Table ────────────────────────────────────────────────────────────
function AccountsTable({ profile }) {
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(new Set());
  const [showGenerate, setShowGen]  = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [status, setStatus]         = useState('');
  const [statusType, setStatusType] = useState('info');

  const [genUsername, setGenUser]   = useState('');
  const [genStart, setGenStart]     = useState(1);
  const [genEnd, setGenEnd]         = useState(100);
  const [genPass, setGenPass]       = useState('');
  const [generating, setGenerating] = useState(false);

  const setMsg = (msg, type = 'info') => { setStatus(msg); setStatusType(type); };

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await accountsAPI.getAll(profile); setAccounts(r.data.accounts || []); }
    catch { setMsg('Failed to load accounts', 'error'); }
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll    = ()   => setSelected(s => s.size === accounts.length ? new Set() : new Set(accounts.map(a => a.id)));

  const handleDeleteSelected = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} accounts?`)) return;
    try { await accountsAPI.bulkDelete(profile, [...selected]); setSelected(new Set()); setMsg(`✅ Deleted ${selected.size}`, 'success'); await load(); }
    catch { setMsg('❌ Delete failed', 'error'); }
  };
  const handleClearAll = async () => {
    if (!confirm(`Clear ALL ${accounts.length} accounts? Cannot be undone.`)) return;
    try { await accountsAPI.clearAll(profile); setSelected(new Set()); setMsg('✅ All cleared', 'success'); await load(); }
    catch { setMsg('❌ Clear failed', 'error'); }
  };
  const handleImport = async () => {
    const parsed = importText.trim().split('\n').map(l => {
      const [u, pw] = l.trim().split(':');
      return u && pw ? { username: u.trim(), password: pw.trim() } : null;
    }).filter(Boolean);
    if (!parsed.length) { setMsg('⚠️ No valid lines (format: user:pass)', 'error'); return; }
    try {
      const r = await accountsAPI.bulkImport(profile, parsed);
      setImportText(''); setShowImport(false);
      setMsg(`✅ Added ${r.data.added} | Skipped ${r.data.duplicates} duplicates`, 'success');
      await load();
    } catch { setMsg('❌ Import failed', 'error'); }
  };
  const handleGenerate = async () => {
    if (!genUsername.trim()) { setMsg('⚠️ Username required', 'error'); return; }
    if (genStart > genEnd) { setMsg('⚠️ Start must be ≤ End', 'error'); return; }
    const count = genEnd - genStart + 1;
    if (count > 5000) { setMsg('⚠️ Max 5000 per generation', 'error'); return; }
    setGenerating(true); setMsg(`Generating ${count}...`);
    try {
      const r = await accountsAPI.generate(profile, { username: genUsername.trim(), startRange: genStart, endRange: genEnd, password: genPass.trim() || 'password123' });
      setMsg(`✅ Generated ${r.data.generated} | Added ${r.data.added} | Skipped ${r.data.duplicates}`, 'success');
      setShowGen(false); await load();
    } catch (e) { setMsg(`❌ ${e.message}`, 'error'); }
    setGenerating(false);
  };

 const previewName = genUsername
  ? `${genUsername}${genStart} … ${genUsername}${genEnd}`
  : '';

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {accounts.length.toLocaleString()} accounts{selected.size > 0 && ` · ${selected.size} selected`}
        </span>
        <div style={{ flex: 1 }} />
        {selected.size > 0 && <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}><Trash2 size={11} /> Delete ({selected.size})</button>}
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}><RefreshCw size={11} className={loading ? 'spin' : ''} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(v => !v)}><Upload size={11} /> Import</button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowGen(v => !v)}><Plus size={11} /> Generate</button>
        {accounts.length > 0 && <button className="btn btn-danger btn-sm" onClick={handleClearAll}><Trash2 size={11} /> Clear All</button>}
      </div>

      {status && (
        <div style={{
          padding: '6px 10px', marginBottom: 10, borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 11,
          color: statusType === 'success' ? 'var(--success)' : statusType === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
        }}>{status}</div>
      )}

      {/* Generate panel */}
      {showGenerate && (
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase' }}>⚡ Generate Accounts</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Username Base *</label>
              <input className="input" placeholder="e.g. player, user" value={genUsername} onChange={e => setGenUser(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password</label>
              <input className="input" placeholder="password123 (default)" value={genPass} onChange={e => setGenPass(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Range</label>
              <input className="input" type="number" min={1} value={genStart} onChange={e => setGenStart(parseInt(e.target.value) || 1)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Range</label>
              <input className="input" type="number" min={genStart} value={genEnd} onChange={e => setGenEnd(parseInt(e.target.value) || 100)} />
            </div>
          </div>
          {genUsername && (
            <div style={{ padding: '6px 10px', background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>Preview: </span>
              <span style={{ color: 'var(--accent)' }}>{previewName}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({Math.max(0, genEnd - genStart + 1).toLocaleString()} accounts)</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : `⚡ Generate ${(genEnd - genStart + 1).toLocaleString()}`}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowGen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Import panel */}
      {showImport && (
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--text-primary)', marginBottom: 10, textTransform: 'uppercase' }}>Bulk Import</div>
          <label className="form-label">Format: username:password (one per line)</label>
          <textarea className="textarea" rows={5} placeholder={"player001:pass123\nplayer002:pass456"} value={importText} onChange={e => setImportText(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleImport}>↑ Import</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input type="checkbox" onChange={toggleAll} checked={selected.size === accounts.length && accounts.length > 0} />
              </th>
              <th>Username</th>
              <th>Score</th>
              <th>Last Processed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Loading...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No accounts yet — use Generate or Import above</td></tr>
            ) : accounts.slice(0, 300).map(a => (
              <tr key={a.id} style={{ background: selected.has(a.id) ? 'rgba(255,107,26,0.04)' : undefined }}>
                <td><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{a.username}</td>
                <td style={{ color: 'var(--accent)' }}>{a.score || 0}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{a.last_processed ? new Date(a.last_processed).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {accounts.length > 300 && (
          <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Showing first 300 of {accounts.length.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats Panel ───────────────────────────────────────────────────────────────
function StatsPanel({ profile, liveStats }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetch = () => statsAPI.get(profile).then(r => setStats(r.data)).catch(() => {});
    fetch();
    // Poll every 30 s — matches the status poll cadence to keep
    // total server load within bounds for 200 concurrent users.
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, [profile]);

  const t    = stats?.totals || {};
  const live = liveStats || {};

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total Processed',   value: (t.totalProcessed   || 0).toLocaleString() },
          { label: 'Total Wins',        value: (t.totalWins        || 0).toLocaleString(), accent: 'accent' },
          { label: 'Regular Wheel Spins', value: (t.totalRegularSpins || 0).toLocaleString(), accent: 'amber' },
          { label: 'Weekend Wheel Spins', value: (t.totalWeekendSpins || 0).toLocaleString(), accent: 'violet' },
          { label: 'Total Score Won',   value: (t.totalScoreWon    || 0).toLocaleString(), accent: 'accent' },
          { label: 'Sessions',          value: (t.totalSessions    || 0).toString() },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
            <div className="stat-label" style={{ fontSize: 8 }}>{s.label}</div>
            <div className={`stat-value ${s.accent || ''}`} style={{ fontSize: 20 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {live.isRunning && (
        <div style={{ padding: 12, background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase' }}>● Live Session</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: 'Success',  value: live.successCount || 0 },
              { label: 'Failed',   value: live.failCount    || 0 },
              { label: 'IP Banned', value: live.ipBanned     || 0 },
              { label: 'Workers',  value: live.activeWorkers || 0 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ProfilePage ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profileName } = useParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const { game } = useGame();
  const [tab, setTab]           = useState('terminal');
  const [logs, setLogs]         = useState([]);
  const [botStatus, setBotStatus] = useState({ running: false });
  const [liveStats, setLiveStats] = useState(null);
  const [starting, setStarting]   = useState(false);

  // ── Game mode selection ────────────────────────────────────────────────────
  // Persisted per-profile so user's choice survives page reload
  const storageKey = `_fk_mode_${profileName}`;
  const [wheelMode, setWheelMode] = useState(
    () => localStorage.getItem(storageKey) || 'single'
  );
  const [repetitions, setReps] = useState(1);

  const handleModeChange = (mode) => {
    if (botStatus.running) return; // can't change while running
    setWheelMode(mode);
    localStorage.setItem(storageKey, mode);
  };

  // ── Socket events ──────────────────────────────────────────────────────────
  const handleEvent = useCallback((event, data) => {
    if (event === 'bot:terminal') {
      setLogs(prev => [...prev.slice(-600), data]);
    } else if (event === 'bot:status') {
      setBotStatus(data);
      if (data.running) setLiveStats(data);
    } else if (event === 'bot:completed') {
      setBotStatus(s => ({ ...s, running: false }));
      setLiveStats(null);
    } else if (event === 'bot:wheelStats') {
      setLiveStats(prev => prev ? { ...prev, ...data } : data);
    } else if (event === 'bot:cycleUpdate') {
      setBotStatus(s => ({ ...s, currentCycle: data.cyclesCompleted, totalCycles: data.totalCycles }));
    }
  }, []);

  useBotEvents(profileName, handleEvent);

  // ── Poll status ────────────────────────────────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await processingAPI.status(profileName);
        setBotStatus(r.data);
        if (r.data.wheelMode) {
          setWheelMode(r.data.wheelMode);
          localStorage.setItem(storageKey, r.data.wheelMode);
        }
      } catch (_) {}
    };
    poll();
    // Poll every 30 s — Socket.IO pushes real-time updates so this is
    // only a fallback sync. 10 s × 200 users = 1200 req/min which
    // saturates the server; 30 s keeps it at ~400 req/min.
    const iv = setInterval(poll, 30000);
    return () => clearInterval(iv);
  }, [profileName, storageKey]);

  // ── Start/Stop ─────────────────────────────────────────────────────────────
  const handleStart = async () => {
    setStarting(true);
    try {
      // If game has no weekend wheel, always force single mode
      const effectiveMode = game.noWeekendSpin ? 'single' : wheelMode;

      // Send game server config so backend connects to the right WS URL.
      // ORIGIN is critical — wrong origin causes server to reject login.
      const gameConfig = {
        id:            game.id,
        LOGIN_WS_URL:  game.LOGIN_WS_URL,
        GAME_VERSION:  game.GAME_VERSION,
        ORIGIN:        game.ORIGIN,
        noWeekendSpin: !!game.noWeekendSpin,
      };

      await processingAPI.start(profileName, {
        workers:     game.workers || 20,
        wheelMode:   effectiveMode,
        repetitions: effectiveMode === 'double' ? repetitions : 1,
        gameConfig,
      });
      setBotStatus(s => ({ ...s, running: true, wheelMode }));
      setLogs([]);
      setTab('terminal');
    } catch (e) {
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Failed to start: ${e.response?.data?.error || e.message}`,
        timestamp: new Date().toISOString(),
      }]);
    }
    setStarting(false);
  };

  const handleStop = async () => {
    try {
      await processingAPI.stop(profileName);
      setBotStatus(s => ({ ...s, running: false }));
    } catch (_) {}
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const running         = botStatus.running;
  const modeColor       = wheelMode === 'double' ? 'var(--double-color)' : 'var(--single-color)';
  const modeLabel       = wheelMode === 'double' ? 'Double Spin – Weekend Wheel' : 'Single Spin – Daily Wheel';
  const progressClass   = wheelMode === 'double' ? 'violet' : 'amber';
  const cycleProgress   = botStatus.totalCycles > 0
    ? ((botStatus.currentCycle || 0) / botStatus.totalCycles) * 100
    : 0;

  const TABS = [
    { id: 'terminal', label: 'Terminal',  icon: Terminal  },
    { id: 'accounts', label: 'Accounts',  icon: Users     },
    { id: 'stats',    label: 'Stats',     icon: BarChart3 },
    { id: 'proxy',    label: 'Proxy',     icon: Shield    },
  ];

  return (
    <Layout title={profileName.replace('_', ' ')}>
      <div style={{ maxWidth: 1000 }}>

        {/* ── Wheel Mode Selector ── */}
        {!running && (
          <div className="card" style={{ marginBottom: 16 }}>
            <WheelModeSelector value={wheelMode} onChange={handleModeChange} disabled={running} game={game} />
          </div>
        )}

        {/* ── Control Bar ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

            {/* Status dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`dot ${running ? 'dot-orange dot-pulse' : 'dot-grey'}`} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                color: running ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
                {running ? 'RUNNING' : 'IDLE'}
              </span>
            </div>

            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

            {/* Active mode badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `${modeColor}12`,
              border: `1px solid ${modeColor}40`,
              borderRadius: 20, padding: '3px 12px',
            }}>
              <span style={{ fontSize: 12 }}>{wheelMode === 'double' ? '✨' : '☀️'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: modeColor, fontWeight: 700 }}>
                {wheelMode === 'double' ? 'DOUBLE SPIN' : 'SINGLE SPIN'}
              </span>
            </div>
            {/* Active game badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `${game.color}12`,
              border: `1px solid ${game.color}40`,
              borderRadius: 20, padding: '3px 12px',
            }}>
              <span style={{ fontSize: 12 }}>{game.emoji}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: game.color, fontWeight: 700 }}>
                {game.shortLabel}
              </span>
            </div>

            {/* Cycles — only for double spin */}
            {wheelMode === 'double' && !running && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CYCLES</span>
                <input type="number" value={repetitions} min={1} max={50}
                  onChange={e => setReps(parseInt(e.target.value) || 1)}
                  style={{
                    width: 60, padding: '5px 8px', background: 'var(--bg-raised)',
                    border: '1px solid var(--border-lit)', borderRadius: 4,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                    outline: 'none',
                  }} />
              </div>
            )}

            {running && botStatus.totalCycles > 1 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                Cycle {botStatus.currentCycle}/{botStatus.totalCycles}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {!running ? (
              <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={starting}>
                <Play size={14} />
                {starting ? 'STARTING...' : `START ${wheelMode === 'double' ? 'DOUBLE' : 'SINGLE'} SPIN`}
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleStop}>
                <Square size={13} />
                STOP BOT
              </button>
            )}
          </div>

          {/* Progress bar */}
          {running && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5,
              }}>
                <span>{modeLabel}</span>
                {botStatus.totalCycles > 1 && <span>Cycle {botStatus.currentCycle || 0}/{botStatus.totalCycles}</span>}
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${progressClass}`} style={{ width: `${cycleProgress || 30}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div className="tab-nav" style={{ background: 'var(--bg-raised)', padding: '0 8px' }}>
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <t.icon size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {tab === 'terminal' && (
              <div>
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <span className="card-title">Live Output</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>Clear</button>
                </div>
                <BotTerminal logs={logs} />

                {/* Live stats strip */}
                {running && liveStats && (
                  <div style={{
                    display: 'flex', gap: 16, marginTop: 12,
                    padding: '8px 12px', background: 'var(--bg-raised)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                  }}>
                    {[
                      { label: 'Workers', value: liveStats.activeWorkers || liveStats.stats?.activeWorkers || 0 },
                      { label: 'Success',  value: liveStats.successCount  || liveStats.stats?.successCount  || 0 },
                      { label: 'Failed',   value: liveStats.failCount     || liveStats.stats?.failCount     || 0 },
                      { label: 'IP Banned', value: liveStats.ipBanned || liveStats.stats?.ipBanned || 0, color: '#ef4444' },
                      wheelMode === 'double' && { label: 'Regular', value: liveStats.regularWheelSpins || 0, color: 'var(--single-color)' },
                      wheelMode === 'double' && { label: 'Weekend', value: liveStats.weekendWheelSpins || 0, color: 'var(--double-color)' },
                      { label: 'Score Won', value: liveStats.totalScoreWon || 0, color: 'var(--accent)' },
                    ].filter(Boolean).map(s => (
                      <div key={s.label} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s.label}:</span>
                        <span style={{ fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === 'accounts' && <AccountsTable profile={profileName} />}
            {tab === 'stats'    && <StatsPanel profile={profileName} liveStats={liveStats} />}
            {tab === 'proxy'    && <ProxyPanel profile={profileName} />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
