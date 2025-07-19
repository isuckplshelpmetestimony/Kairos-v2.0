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
    return (
      <div className="card-premium p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-gray-300">Admin only.</p>
      </div>
    );
  }

  return (
    <div className="card-premium p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold gradient-text mb-8">Admin Panel</h2>

      <div className="flex space-x-4 mb-8">
        <button
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'payments' 
              ? 'btn-premium' 
              : 'text-white border border-white/20 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Submissions ({paymentSubmissions.filter(p => p.status === 'pending').length})
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'users' 
              ? 'btn-premium' 
              : 'text-white border border-white/20 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('users')}
        >
          All Users ({users.length})
        </button>
      </div>

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6">Pending Payments</h3>
          {paymentSubmissions.filter(p => p.status === 'pending').map(payment => (
            <div key={payment.id} className="card-premium p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-gray-300"><span className="text-white font-semibold">Email:</span> {payment.email}</p>
                  <p className="text-gray-300"><span className="text-white font-semibold">Phone:</span> {payment.phone}</p>
                  <p className="text-gray-300"><span className="text-white font-semibold">Submitted:</span> {new Date(payment.timestamp || payment.submitted_at).toLocaleString()}</p>
                  <p className="text-gray-300"><span className="text-white font-semibold">Status:</span> 
                    <span className="badge-premium ml-2">{payment.status}</span>
                  </p>
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => approvePayment(payment.id.toString())}
                    className="btn-premium"
                  >
                    Approve Payment
                  </button>
                  <button
                    onClick={() => rejectPayment(payment.id.toString())}
                    className="px-4 py-2 text-white border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Reject Payment
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paymentSubmissions.filter(p => p.status === 'pending').length === 0 && (
            <div className="text-center text-gray-300 py-8">
              <p>No pending payments</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6">All Users</h3>
          {users.map(user => (
            <div key={user.id} className="card-premium p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-gray-300"><span className="text-white font-semibold">Email:</span> {user.email}</p>
                  <p className="text-gray-300"><span className="text-white font-semibold">Phone:</span> {user.phone}</p>
                  <p className="text-gray-300"><span className="text-white font-semibold">Role:</span> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'premium' ? 'badge-premium' : 
                      user.role === 'admin' ? 'bg-red-900/50 text-red-300 border border-red-500/30' :
                      'bg-gray-800/50 text-gray-300 border border-gray-600/30'
                    }`}>
                      {user.role}
                    </span>
                  </p>
                  <p className="text-gray-300"><span className="text-white font-semibold">Status:</span> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-900/50 text-green-300 border border-green-500/30' :
                      user.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' :
                      'bg-red-900/50 text-red-300 border border-red-500/30'
                    }`}>
                      {user.status}
                    </span>
                  </p>
                  {user.premiumUntil && (
                    <p className="text-gray-300"><span className="text-white font-semibold">Premium Until:</span> {new Date(user.premiumUntil).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-3">
                  {user.role === 'free' && (
                    <button
                      onClick={() => grantPremiumAccess(user.id)}
                      className="btn-premium"
                    >
                      Grant Premium
                    </button>
                  )}
                  {user.role === 'premium' && (
                    <button
                      onClick={() => revokePremiumAccess(user.id)}
                      className="px-4 py-2 text-white border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      Revoke Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center text-gray-300 py-8">
              <p>No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 