import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let success = false;

      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        if (!formData.phone) {
          setError('Phone number is required');
          return;
        }
        success = await signup(formData.email, formData.password, formData.phone);
      }

      if (success) {
        onClose();
        setFormData({ email: '', password: '', phone: '' });
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          {!isLogin && (
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          )}

          <button type="submit" disabled={isLoading} className="auth-submit-btn">
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="auth-switch-btn"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal; 