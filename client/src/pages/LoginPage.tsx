import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'wouter';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result === 'unauthorized') {
        setError('Invalid email or password');
      } else if (result === false) {
        setError('An unexpected error occurred. Please try again.');
      }
      // Do not redirect here; let useEffect handle it when user updates
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1b3a 0%, #2d2f5e 100%)' }}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {/* KAIROS Logo - Perfectly centered */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-5xl font-bold gradient-text tracking-wider">
            KAIROS
          </h1>
        </div>
        
        <div className="card-premium p-8 w-full">
          <h2 className="text-3xl font-bold gradient-text mb-8 text-center">Sign In</h2>
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full input-premium"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full input-premium"
              />
            </div>
            <button 
              type="submit" 
              className="w-full btn-premium" 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-gray-300 mt-6">
            Don't have an account?{' '}
            <Link href="/signup">
              <button className="gradient-text hover:underline font-medium">
                Sign Up
              </button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 