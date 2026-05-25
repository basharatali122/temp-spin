// /**
//  * gameConfig.js — Supported game servers for the Spin Claimer.
//  *
//  * LOGIN_WS_URL   : WebSocket URL for the login/spin server.
//  * ORIGIN         : HTTP Origin header sent with every WS handshake.
//  *                  MUST match what the real browser sends — wrong origin = login rejected.
//  * noWeekendSpin  : true → game has no weekend wheel, always use single spin only.
//  *
//  * Verified from actual browser DevTools captures:
//  *   Pandamaster  origin: http://play.pandamaster.vip
//  *   MilkyWay     origin: https://play.milkywayapp.xyz
//  *   MegaSpin     origin: http://47.251.75.73  (plain ws, no wss)
//  *   OrionStars   origin: http://34.213.5.211  (plain ws, no wss)
//  */

// export const GAMES = [
//   {
//     id:            'pandamaster',
//     label:         'Panda Master',
//     shortLabel:    'PM',
//     emoji:         '🐼',
//     color:         '#fb923c',
//     LOGIN_WS_URL:  'wss://pandamaster.vip:7878/',
//     GAME_VERSION:  '2.0.1',
//     ORIGIN:        'http://play.pandamaster.vip',
//     noWeekendSpin: false,
//   },
//   {
//     id:            'milkyway',
//     label:         'MilkyWay',
//     shortLabel:    'MW',
//     emoji:         '🌌',
//     color:         '#a78bfa',
//     LOGIN_WS_URL:  'wss://game.milkywayapp.xyz:7878/',
//     GAME_VERSION:  '2.0.1',
//     ORIGIN:        'https://play.milkywayapp.xyz',
//     noWeekendSpin: false,
//   },
//   {
//     id:            'megaspin',
//     label:         'Mega Spin',
//     shortLabel:    'MS',
//     emoji:         '⭐',
//     color:         '#38bdf8',
//     LOGIN_WS_URL:  'ws://47.251.75.73:8600/',
//     GAME_VERSION:  '2.0.1',
//     ORIGIN:        'http://47.251.75.73',
//     noWeekendSpin: true,   // MegaSpin only has one spin — no weekend wheel
//   },
//   {
//     id:            'orion',
//     label:         'OrionStars',
//     shortLabel:    'OS',
//     emoji:         '⭐',
//     color:         '#34d399',
//     LOGIN_WS_URL:  'ws://34.213.5.211:8600/',
//     GAME_VERSION:  '2.0.1',
//     ORIGIN:        'http://34.213.5.211',
//     noWeekendSpin: true,   // OrionStars — confirm weekend availability before enabling
//   },
//   {
//     id:            'firekirin',
//     label:         'FireKirin',
//     shortLabel:    'FK',
//     emoji:         '🔥',
//     color:         '#ff6b1a',
//     LOGIN_WS_URL:  'ws://54.244.43.127:8600/',
//     GAME_VERSION:  '2.0.1',
//     ORIGIN:        'http://54.244.43.127',
//     noWeekendSpin: false,
//   },
// ];

// export const DEFAULT_GAME_ID = 'pandamaster';

// export function getGame(id) {
//   return GAMES.find(g => g.id === id) || GAMES[0];
// }




/**
 * gameConfig.js — Supported game servers for the Spin Claimer.
 *
 * LOGIN_WS_URL   : WebSocket URL for the login/spin server.
 * ORIGIN         : HTTP Origin header sent with every WS handshake.
 *                  MUST match what the real browser sends — wrong origin = rejected.
 * noWeekendSpin  : true → game has no weekend wheel, use single spin only.
 * workers        : Recommended concurrent worker count for this game.
 *                  PandaMaster is strict on IPs — lower count prevents bans.
 *
 * Verified from actual browser DevTools captures.
 */

export const GAMES = [
  {
    id:            'pandamaster',
    label:         'Panda Master',
    shortLabel:    'PM',
    emoji:         '🐼',
    color:         '#fb923c',
    LOGIN_WS_URL:  'wss://pandamaster.vip:7878/',
    GAME_VERSION:  '2.0.1',
    ORIGIN:        'http://play.pandamaster.vip',
    noWeekendSpin: false,
    workers:       15,   // PM bans IPs aggressively — keep lower
    note:          'Strict IP limits — use dedicated proxies',
  },
  {
    id:            'milkyway',
    label:         'MilkyWay',
    shortLabel:    'MW',
    emoji:         '🌌',
    color:         '#a78bfa',
    LOGIN_WS_URL:  'wss://game.milkywayapp.xyz:7878/',
    GAME_VERSION:  '2.0.1',
    ORIGIN:        'https://play.milkywayapp.xyz',
    noWeekendSpin: false,
    workers:       33,
    note:          null,
  },
  {
    id:            'megaspin',
    label:         'Mega Spin',
    shortLabel:    'MS',
    emoji:         '⭐',
    color:         '#38bdf8',
    LOGIN_WS_URL:  'ws://47.251.75.73:8600/',
    GAME_VERSION:  '2.0.1',
    ORIGIN:        'http://okay.jkgame.vip',
    noWeekendSpin: true,
    workers:       15,
    note:          null,
  },
  {
    id:            'orion',
    label:         'OrionStars',
    shortLabel:    'OS',
    emoji:         '🌟',
    color:         '#34d399',
    LOGIN_WS_URL:  'ws://34.213.5.211:8600/',
    GAME_VERSION:  '2.0.1',
    ORIGIN:        'http://34.213.5.211',
    noWeekendSpin: true,
    workers:       30,
    note:          null,
  },
  {
    id:            'firekirin',
    label:         'FireKirin',
    shortLabel:    'FK',
    emoji:         '🔥',
    color:         '#ff6b1a',
    LOGIN_WS_URL:  'ws://54.244.43.127:8600/',
    GAME_VERSION:  '2.0.1',
    ORIGIN:        'http://54.244.43.127',
    noWeekendSpin: false,
    workers:       30,
    note:          null,
  },
];

export const DEFAULT_GAME_ID = 'milkyway';

export function getGame(id) {
  return GAMES.find(g => g.id === id) || GAMES[0];
}
