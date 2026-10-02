import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { NotFoundPage, ServerErrorPage } from './pages/ErrorPages';
import './App.css';

// Lazy load portals to optimize bundles
const DashboardLayout = lazy(() => import('./pages/DashboardLayout'));
const ConsumerPortal = lazy(() => import('./pages/ConsumerPortal'));
const EngineerPortal = lazy(() => import('./pages/EngineerPortal'));

// Route Guard Component
function ProtectedRoute({ children, sessionKey, redirectPath }) {
  const session = localStorage.getItem(sessionKey);
  if (!session) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
}

// Fallback Loading screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white animate-spin">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">Initializing Portal...</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Entrance */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Admin Board */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute sessionKey="admin_session" redirectPath="/login">
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Consumer Portal Routing */}
          <Route path="/consumer/login" element={<ConsumerPortal initialView="login" />} />
          <Route path="/consumer/register" element={<ConsumerPortal initialView="register" />} />
          
          <Route 
            path="/consumer/dashboard" 
            element={
              <ProtectedRoute sessionKey="consumer_session" redirectPath="/consumer/login">
                <ConsumerPortal initialView="dashboard" />
              </ProtectedRoute>
            } 
          />
          <Route path="/track" element={<ConsumerPortal initialView="track" />} />

          {/* Engineer Portal Routing */}
          <Route path="/engineer/login" element={<EngineerPortal initialView="login" />} />
          
          <Route 
            path="/engineer/dashboard" 
            element={
              <ProtectedRoute sessionKey="engineer_session" redirectPath="/engineer/login">
                <EngineerPortal initialView="dashboard" />
              </ProtectedRoute>
            } 
          />

          {/* Error Boundaries */}
          <Route path="/error/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
