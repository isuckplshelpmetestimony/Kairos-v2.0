import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  phone: string;
  role: 'admin' | 'premium' | 'free';
  status: 'active' | 'pending' | 'expired';
  createdAt: string;
  premiumUntil?: string;
}

interface PaymentSubmission {
  id: number;
  email: string;
  phone: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('payments');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, []);

  const loadData = () => {
    // Load users
    const usersData = JSON.parse(localStorage.getItem('kairos_users') || '[]');
    setUsers(usersData);

    // Load payment submissions
    const paymentsData = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');
    setPaymentSubmissions(paymentsData);
  };

  const grantPremiumAccess = (userEmail: string) => {
    const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
    const updatedUsers = users.map((user: User) => {
      if (user.email === userEmail) {
        return {
          ...user,
          role: 'premium',
          status: 'active',
          premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };
      }
      return user;
    });

    localStorage.setItem('kairos_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Update payment status
    const payments = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');
    const updatedPayments = payments.map((payment: PaymentSubmission) => {
      if (payment.email === userEmail) {
        return { ...payment, status: 'approved' };
      }
      return payment;
    });

    localStorage.setItem('paymentSubmissions', JSON.stringify(updatedPayments));
    setPaymentSubmissions(updatedPayments);
  };

  const revokePremiumAccess = (userEmail: string) => {
    const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
    const updatedUsers = users.map((user: User) => {
      if (user.email === userEmail) {
        return {
          ...user,
          role: 'free',
          status: 'active',
          premiumUntil: undefined
        };
      }
      return user;
    });

    localStorage.setItem('kairos_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  if (!isAdmin()) {
    return <div>Access denied. Admin only.</div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="admin-tabs">
        <button
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          Payment Submissions ({paymentSubmissions.filter(p => p.status === 'pending').length})
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          All Users ({users.length})
        </button>
      </div>

      {activeTab === 'payments' && (
        <div className="payments-tab">
          <h3>Pending Payments</h3>
          {paymentSubmissions.filter(p => p.status === 'pending').map(payment => (
            <div key={payment.id} className="payment-card">
              <div className="payment-info">
                <p><strong>Email:</strong> {payment.email}</p>
                <p><strong>Phone:</strong> {payment.phone}</p>
                <p><strong>Submitted:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> {payment.status}</p>
              </div>
              <div className="payment-actions">
                <button
                  onClick={() => grantPremiumAccess(payment.email)}
                  className="approve-btn"
                >
                  Grant Premium Access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-tab">
          <h3>All Users</h3>
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.status}</p>
                {user.premiumUntil && (
                  <p><strong>Premium Until:</strong> {new Date(user.premiumUntil).toLocaleDateString()}</p>
                )}
              </div>
              <div className="user-actions">
                {user.role === 'free' && (
                  <button
                    onClick={() => grantPremiumAccess(user.email)}
                    className="grant-btn"
                  >
                    Grant Premium
                  </button>
                )}
                {user.role === 'premium' && (
                  <button
                    onClick={() => revokePremiumAccess(user.email)}
                    className="revoke-btn"
                  >
                    Revoke Premium
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 