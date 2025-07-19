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

  // Check if we're on login or signup pages
  const isAuthPage = location === '/login' || location === '/signup';

  // Redirect unauthenticated users to login page
  useEffect(() => {
    if (!user && !isAuthPage && location === '/') {
      setLocation('/login');
    }
  }, [user, isAuthPage, location, setLocation]);

  useEffect(() => {
    // Load premium users from localStorage
    const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
    const premium = users.filter((u: any) => u.role === 'premium' && u.status === 'active');
    setPremiumUsers(premium);
  }, [showAdminPanel, showPaymentModal]);

  return (
    <div className="app">
      {/* Header - Only show on main page */}
      {!isAuthPage && (
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold gradient-text tracking-wider">
                  KAIROS
                </h1>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <span className="text-gray-300 text-sm">
                      Welcome, {user.email} ({user.role})
                    </span>
                    {isAdmin() && (
                      <button 
                        onClick={() => setShowAdminPanel(true)}
                        className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Admin Panel
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        logout();
                        setLocation('/login');
                      }}
                      className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setLocation('/login')}
                      className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setLocation('/signup')}
                      className="px-4 py-2 btn-premium"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
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
