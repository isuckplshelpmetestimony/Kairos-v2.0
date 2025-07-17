import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminPanel from './components/AdminPanel';
import Home from './pages/home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Route, Switch, useLocation } from 'wouter';

const AppContent: React.FC = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [premiumUsers, setPremiumUsers] = useState<any[]>([]);
  const { user, logout, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Load premium users from localStorage
    const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
    const premium = users.filter((u: any) => u.role === 'premium' && u.status === 'active');
    setPremiumUsers(premium);
  }, [showAdminPanel, showPaymentModal]);

  return (
    <div className="app">
      {/* Header with auth buttons */}
      <header className="app-header">
        <h1>Kairos v2.0</h1>
        <div className="auth-buttons">
          {user ? (
            <>
              <span>Welcome, {user.email} ({user.role})</span>
              {isAdmin() && (
                <button onClick={() => setShowAdminPanel(true)}>Admin Panel</button>
              )}
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setLocation('/login')}>Sign In</button>
              <button onClick={() => setLocation('/signup')}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {/* Routing */}
      <Switch>
        <Route path="/" component={() => (
          <Home
            user={user || { email: '', phone: '', role: 'free' }}
            premiumUsers={premiumUsers}
            setShowPaymentModal={setShowPaymentModal}
            showPaymentModal={showPaymentModal}
          />
        )} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
      </Switch>

      {/* Admin Panel Modal */}
      {showAdminPanel && isAdmin() && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AdminPanel />
            <button onClick={() => setShowAdminPanel(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
