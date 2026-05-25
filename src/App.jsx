import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { GameProvider } from './hooks/useGame';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage   from './pages/ProfilePage';

// Each logged-in user has exactly one profile (Profile_1).
// The backend namespaces it by userId so two users never share data.
export const USER_PROFILE = 'Profile_1';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#050508', color: '#ff6b1a',
      fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: 2,
    }}>
      IGNITING...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/profile/:profileName" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}
