export const GAMES = [
  {
    id:                 'pandamaster',
    label:              'Panda Master',
    shortLabel:         'PM',
    emoji:              '🐼',
    color:              '#fb923c',
    LOGIN_WS_URL:       'wss://pandamaster.vip:7878/',
    GAME_VERSION:       '2.0.1',
    ORIGIN:             'http://play.pandamaster.vip',
    noWeekendSpin:      false,
    workers:            5,    // rate-limited to 5/min → only need 5 workers
    accountsPerMinute:  5,    // 1 every 12 s — PM bans IPs aggressively
    note:               'Strict IP limits — use dedicated proxies',
  },
  {
    id:                 'milkyway',
    label:              'MilkyWay',
    shortLabel:         'MW',
    emoji:              '🌌',
    color:              '#a78bfa',
    LOGIN_WS_URL:       'wss://game.milkywayapp.xyz:7878/',
    GAME_VERSION:       '2.0.1',
    ORIGIN:             'https://play.milkywayapp.xyz',
    noWeekendSpin:      false,
    workers:            10,
    accountsPerMinute:  10,   // 1 every 6 s — MW is more relaxed
    note:               null,
  },
  {
    id:                 'megaspin',
    label:              'Mega Spin',
    shortLabel:         'MS',
    emoji:              '⭐',
    color:              '#38bdf8',
    LOGIN_WS_URL:       'ws://47.251.75.73:8600/',
    GAME_VERSION:       '2.0.1',
    ORIGIN:             'http://okay.jkgame.vip',
    noWeekendSpin:      true,
    workers:            5,
    accountsPerMinute:  5,    // 1 every 12 s
    note:               null,
  },
  {
    id:                 'orion',
    label:              'OrionStars',
    shortLabel:         'OS',
    emoji:              '🌟',
    color:              '#34d399',
    LOGIN_WS_URL:       'ws://34.213.5.211:8600/',
    GAME_VERSION:       '2.0.1',
    ORIGIN:             'http://34.213.5.211',
    noWeekendSpin:      true,
    workers:            10,
    accountsPerMinute:  10,   // 1 every 6 s
    note:               null,
  },
  {
    id:                 'firekirin',
    label:              'FireKirin',
    shortLabel:         'FK',
    emoji:              '🔥',
    color:              '#ff6b1a',
    LOGIN_WS_URL:       'ws://54.244.43.127:8600/',
    GAME_VERSION:       '2.0.1',
    ORIGIN:             'http://54.244.43.127',
    noWeekendSpin:      false,
    workers:            10,
    accountsPerMinute:  10,   // 1 every 6 s
    note:               null,
  },
];

export const DEFAULT_GAME_ID = 'milkyway';

export function getGame(id) {
  return GAMES.find(g => g.id === id) || GAMES[0];
}
