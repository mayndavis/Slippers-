import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Celebration from './pages/Celebration';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;
  if (!userProfile?.onboardingComplete) return <Navigate to="/onboarding" />;

  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;
  if (userProfile?.onboardingComplete) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;
  if (currentUser && userProfile?.onboardingComplete) return <Navigate to="/dashboard" />;
  if (currentUser && !userProfile?.onboardingComplete) return <Navigate to="/onboarding" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/celebration" element={<ProtectedRoute><Celebration /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
