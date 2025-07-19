import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

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
  userId?: string;
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

  const loadData = async () => {
    try {
      // Load users from backend
      const usersResponse = await apiClient.getUsers();
      if (usersResponse.data) {
        setUsers(usersResponse.data.users || usersResponse.data);
      }
      // Load payments from backend
      const paymentsResponse = await apiClient.getPayments();
      if (paymentsResponse.data) {
        setPaymentSubmissions(paymentsResponse.data.payments || paymentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const grantPremiumAccess = async (userId: string) => {
    try {
      const response = await apiClient.grantPremium(userId);
      if (response.data) {
        // Reload data to reflect changes
        loadData();
      }
    } catch (error) {
      console.error('Error granting premium:', error);
    }
  };

  const revokePremiumAccess = async (userId: string) => {
    try {
      const response = await apiClient.revokePremium(userId);
      if (response.data) {
        // Reload data to reflect changes
        loadData();
      }
    } catch (error) {
      console.error('Error revoking premium:', error);
    }
  };

  const approvePayment = async (paymentId: string) => {
    try {
      const response = await apiClient.approvePayment(paymentId);
      if (response.data) {
        // Reload data to reflect changes
        loadData();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const response = await apiClient.rejectPayment(paymentId);
      if (response.data) {
        // Reload data to reflect changes
        loadData();
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
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
                <p><strong>Submitted:</strong> {new Date(payment.timestamp || payment.submitted_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {payment.status}</p>
              </div>
              <div className="payment-actions">
                <button
                  onClick={() => approvePayment(payment.id.toString())}
                  className="approve-btn"
                >
                  Approve Payment
                </button>
                <button
                  onClick={() => rejectPayment(payment.id.toString())}
                  className="reject-btn"
                >
                  Reject Payment
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
                    onClick={() => grantPremiumAccess(user.id)}
                    className="grant-btn"
                  >
                    Grant Premium
                  </button>
                )}
                {user.role === 'premium' && (
                  <button
                    onClick={() => revokePremiumAccess(user.id)}
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