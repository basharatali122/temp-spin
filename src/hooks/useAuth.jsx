// import { createContext, useContext, useEffect, useState } from 'react';
// import { auth } from '../firebase';
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
// } from 'firebase/auth';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser]       = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => {
//       setUser(u);
//       setLoading(false);
//     });
//     return unsub;
//   }, []);

//   const login    = (email, password) => signInWithEmailAndPassword(auth, email, password);
//   const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
//   const logout   = ()                => signOut(auth);

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);




import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();
const AuthContext = createContext(null);

// Fetch the users/{uid} doc and return a rejection reason string,
// or null if the user is allowed in.
async function checkUserStatus(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));

    if (!snap.exists()) {
      return 'Your account was not found. Please contact support.';
    }

    const data = snap.data();

    if (data.status === 'deleted') {
      return 'Your account has been deleted. Please contact support.';
    }

    if (data.status === 'expired') {
      return 'Your account has expired. Please contact support to renew.';
    }

    if (data.status !== 'approved') {
      return 'Your account is pending approval. Please wait for admin confirmation.';
    }

    // Check expiresAt timestamp even if status is still 'approved'
    if (data.expiresAt) {
      const expiresAt = data.expiresAt.toDate
        ? data.expiresAt.toDate()
        : new Date(data.expiresAt);
      if (expiresAt < new Date()) {
        return 'Your account has expired. Please contact support to renew.';
      }
    }

    return null; // all good
  } catch (err) {
    console.error('Error checking user status:', err);
    return 'Unable to verify your account status. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Verify status every time a session is restored (page reload, tab reopen)
        const reason = await checkUserStatus(u.uid);
        if (reason) {
          await signOut(auth);
          setAuthError(reason);
          setUser(null);
        } else {
          setAuthError('');
          setUser(u);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    setAuthError('');
    // Step 1 — Firebase Auth (validates email + password)
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Step 2 — Firestore status check (validates approved + not expired/deleted)
    const reason = await checkUserStatus(cred.user.uid);
    if (reason) {
      await signOut(auth); // immediately kill the Firebase session
      const err = new Error(reason);
      err.code = 'auth/account-restricted';
      throw err;
    }

    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);