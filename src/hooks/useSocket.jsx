// import { useEffect, useRef, useState, useCallback } from 'react';
// import { io } from 'socket.io-client';
// import { auth } from '../firebase';

// // Per-tab socket isolation
// const TAB_ID = (() => {
//   let id = sessionStorage.getItem('_fk_tab_id');
//   if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem('_fk_tab_id', id); }
//   return id;
// })();

// let _socket = null;
// let _connectionPromise = null;
// const _listeners = new Set();

// function notifyListeners(connected) { _listeners.forEach(fn => fn(connected)); }

// async function getSocket() {
//   if (_socket?.connected) return _socket;
//   if (_connectionPromise) return _connectionPromise;

//   _connectionPromise = new Promise(async (resolve) => {
//     try {
//       const user = auth.currentUser;
//       if (!user) { _connectionPromise = null; resolve(null); return; }
//       const token = await user.getIdToken();

//       _socket = io(window.location.origin, {
//         auth: { token },
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 5000,
//         query: { tabId: TAB_ID },
//       });

//       _socket.on('connect', () => {
//         notifyListeners(true);
//         _connectionPromise = null;
//         resolve(_socket);
//       });

//       _socket.on('disconnect', (reason) => {
//         notifyListeners(false);
//         if (reason === 'io server disconnect') {
//           setTimeout(async () => {
//             try {
//               const freshToken = await auth.currentUser?.getIdToken(true);
//               if (freshToken && _socket) { _socket.auth.token = freshToken; _socket.connect(); }
//             } catch (_) {}
//           }, 500);
//         }
//       });

//       _socket.on('connect_error', () => { _connectionPromise = null; resolve(_socket); });
//     } catch (err) {
//       console.error('Socket init error:', err);
//       _connectionPromise = null;
//       resolve(null);
//     }
//   });

//   return _connectionPromise;
// }

// auth.onAuthStateChanged((user) => {
//   if (!user && _socket) {
//     _socket.disconnect();
//     _socket = null;
//     _connectionPromise = null;
//     notifyListeners(false);
//   }
// });

// // ── useSocket ──────────────────────────────────────────────────────────────────
// export function useSocket() {
//   const [connected, setConnected] = useState(_socket?.connected || false);

//   useEffect(() => {
//     const cb = (v) => setConnected(v);
//     _listeners.add(cb);
//     getSocket();
//     return () => { _listeners.delete(cb); };
//   }, []);

//   return { connected };
// }

// // ── useBotEvents — subscribe to a profile's live events ───────────────────────
// export function useBotEvents(profileName, onEvent) {
//   const handlerRef = useRef(onEvent);
//   handlerRef.current = onEvent;

//   useEffect(() => {
//     if (!profileName) return;
//     let sock = null;

//     const subscribe = async () => {
//       sock = await getSocket();
//       if (!sock) return;

//       sock.emit('subscribe:profile', profileName);

//       const events = [
//         'bot:terminal', 'bot:status', 'bot:progress', 'bot:completed',
//         'bot:cycleStart', 'bot:cycleUpdate', 'bot:wheelStats', 'bot:betUpdate',
//       ];

//       for (const ev of events) {
//         sock.on(ev, (data) => handlerRef.current(ev, data));
//       }
//     };

//     subscribe();

//     return () => {
//       if (sock) {
//         sock.emit('unsubscribe:profile');
//         const events = [
//           'bot:terminal', 'bot:status', 'bot:progress', 'bot:completed',
//           'bot:cycleStart', 'bot:cycleUpdate', 'bot:wheelStats', 'bot:betUpdate',
//         ];
//         for (const ev of events) sock.off(ev);
//       }
//     };
//   }, [profileName]);
// }




import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../firebase';

// Per-tab socket isolation
const TAB_ID = (() => {
  let id = sessionStorage.getItem('_fk_tab_id');
  if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem('_fk_tab_id', id); }
  return id;
})();

// ── Backend URL ────────────────────────────────────────────────────────────────
// When deployed (Vercel frontend + Render backend), we must connect to the
// Render backend URL explicitly — NOT window.location.origin (that would try
// to open a WebSocket to Vercel, which is serverless and cannot handle it).
const BACKEND_URL = import.meta.env.VITE_API_URL || window.location.origin;

let _socket = null;
let _connectionPromise = null;
const _listeners = new Set();

function notifyListeners(connected) { _listeners.forEach(fn => fn(connected)); }

async function getSocket() {
  if (_socket?.connected) return _socket;
  if (_connectionPromise) return _connectionPromise;

  _connectionPromise = new Promise(async (resolve) => {
    try {
      const user = auth.currentUser;
      if (!user) { _connectionPromise = null; resolve(null); return; }
      const token = await user.getIdToken();

      // Connect to backend URL (Render), not window.location.origin (Vercel)
      _socket = io(BACKEND_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        query: { tabId: TAB_ID },
      });

      _socket.on('connect', () => {
        notifyListeners(true);
        _connectionPromise = null;
        resolve(_socket);
      });

      _socket.on('disconnect', (reason) => {
        notifyListeners(false);
        if (reason === 'io server disconnect') {
          setTimeout(async () => {
            try {
              const freshToken = await auth.currentUser?.getIdToken(true);
              if (freshToken && _socket) { _socket.auth.token = freshToken; _socket.connect(); }
            } catch (_) {}
          }, 500);
        }
      });

      _socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
        _connectionPromise = null;
        resolve(_socket);
      });
    } catch (err) {
      console.error('Socket init error:', err);
      _connectionPromise = null;
      resolve(null);
    }
  });

  return _connectionPromise;
}

auth.onAuthStateChanged((user) => {
  if (!user && _socket) {
    _socket.disconnect();
    _socket = null;
    _connectionPromise = null;
    notifyListeners(false);
  }
});

// ── useSocket ──────────────────────────────────────────────────────────────────
export function useSocket() {
  const [connected, setConnected] = useState(_socket?.connected || false);

  useEffect(() => {
    const cb = (v) => setConnected(v);
    _listeners.add(cb);
    getSocket();
    return () => { _listeners.delete(cb); };
  }, []);

  return { connected };
}

// ── useBotEvents — subscribe to a profile's live events ───────────────────────
export function useBotEvents(profileName, onEvent) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!profileName) return;
    let sock = null;

    const subscribe = async () => {
      sock = await getSocket();
      if (!sock) return;

      sock.emit('subscribe:profile', profileName);

      const events = [
        'bot:terminal', 'bot:status', 'bot:progress', 'bot:completed',
        'bot:cycleStart', 'bot:cycleUpdate', 'bot:wheelStats', 'bot:betUpdate',
      ];

      for (const ev of events) {
        sock.on(ev, (data) => handlerRef.current(ev, data));
      }
    };

    subscribe();

    return () => {
      if (sock) {
        sock.emit('unsubscribe:profile');
        const events = [
          'bot:terminal', 'bot:status', 'bot:progress', 'bot:completed',
          'bot:cycleStart', 'bot:cycleUpdate', 'bot:wheelStats', 'bot:betUpdate',
        ];
        for (const ev of events) sock.off(ev);
      }
    };
  }, [profileName]);
}