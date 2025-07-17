import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import Home from './pages/home';

const AppContent: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [premiumUsers, setPremiumUsers] = useState<any[]>([]);
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    // Load premium users from localStorage
    const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
    const premium = users.filter((u: any) => u.role === 'premium' && u.status === 'active');
    setPremiumUsers(premium);
  }, [showAdminPanel, showPaymentModal]); // reload when admin panel or payment modal changes

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
            <button onClick={() => setShowAuthModal(true)}>Sign In</button>
          )}
        </div>
      </header>

      {/* Main Kairos events content */}
      <Home
        user={user || { email: '', phone: '', role: 'free' }}
        premiumUsers={premiumUsers}
        setShowPaymentModal={setShowPaymentModal}
        showPaymentModal={showPaymentModal}
      />

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

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
