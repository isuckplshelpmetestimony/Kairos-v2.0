import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'wouter';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        setLocation('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="auth-modal" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account?{' '}
          <Link href="/signup"><button className="auth-switch-btn">Sign Up</button></Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 