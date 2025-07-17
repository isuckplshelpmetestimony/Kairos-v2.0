import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';

const AppContent: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { user, logout, isAdmin, isPremium } = useAuth();

  // Your existing event logic here...

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

      {/* Your existing Kairos content */}
      {/* ... */}

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
