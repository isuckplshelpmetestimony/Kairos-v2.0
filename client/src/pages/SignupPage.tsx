import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'wouter';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!formData.phone) {
        setError('Phone number is required');
        setIsLoading(false);
        return;
      }
      const success = await signup(formData.email, formData.password, formData.phone);
      if (success) {
        setLocation('/');
      } else {
        setError('Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1b3a 0%, #2d2f5e 100%)' }}>
      <div className="card-premium p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold gradient-text mb-8 text-center">Sign Up</h2>
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
          <div>
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full input-premium"
            />
          </div>
          <button 
            type="submit" 
            className="w-full btn-premium" 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-gray-300 mt-6">
          Already have an account?{' '}
          <Link href="/login">
            <button className="gradient-text hover:underline font-medium">
              Sign In
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage; 