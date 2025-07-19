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

interface AdminPanelProps {
  onClose?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading admin data...');
      
      // Load users from backend
      const usersResponse = await apiClient.getUsers();
      console.log('👥 Users response:', usersResponse);
      
      if (usersResponse.data) {
        const userData = usersResponse.data.users || usersResponse.data;
        console.log('✅ Setting users:', userData);
        setUsers(userData);
      } else {
        console.log('❌ No users data in response');
      }
      
      // Load payments from backend
      const paymentsResponse = await apiClient.getPayments();
      console.log('💰 Payments response:', paymentsResponse);
      
      if (paymentsResponse.data) {
        const paymentData = paymentsResponse.data.payments || paymentsResponse.data;
        console.log('✅ Setting payments:', paymentData);
        setPaymentSubmissions(paymentData);
      } else {
        console.log('❌ No payments data in response');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const grantPremiumAccess = async (userId: string) => {
    try {
      console.log('🎁 Granting premium access to user:', userId);
      const response = await apiClient.grantPremium(userId);
      if (response.data) {
        console.log('✅ Premium access granted');
        loadData();
      } else {
        console.log('❌ Failed to grant premium access');
      }
    } catch (error) {
      console.error('❌ Error granting premium:', error);
    }
  };

  const revokePremiumAccess = async (userId: string) => {
    try {
      console.log('🚫 Revoking premium access from user:', userId);
      const response = await apiClient.revokePremium(userId);
      if (response.data) {
        console.log('✅ Premium access revoked');
        loadData();
      } else {
        console.log('❌ Failed to revoke premium access');
      }
    } catch (error) {
      console.error('❌ Error revoking premium:', error);
    }
  };

  const approvePayment = async (paymentId: string) => {
    try {
      console.log('✅ Approving payment:', paymentId);
      const response = await apiClient.approvePayment(paymentId);
      if (response.data) {
        console.log('✅ Payment approved');
        loadData();
      } else {
        console.log('❌ Failed to approve payment');
      }
    } catch (error) {
      console.error('❌ Error approving payment:', error);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      console.log('❌ Rejecting payment:', paymentId);
      const response = await apiClient.rejectPayment(paymentId);
      if (response.data) {
        console.log('✅ Payment rejected');
        loadData();
      } else {
        console.log('❌ Failed to reject payment');
      }
    } catch (error) {
      console.error('❌ Error rejecting payment:', error);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="card-premium max-w-md w-full p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-gray-300">Admin only.</p>
      </div>
    );
  }

  return (
    <div className="card-premium max-w-6xl w-full p-8 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          <h2 className="text-3xl font-bold gradient-text">Admin Panel</h2>
        </div>
        <div className="inline-flex items-center space-x-2 glass-effect px-4 py-2">
          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
          <span className="text-white text-sm font-medium">Admin Controls</span>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        <button
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeTab === 'payments' 
              ? 'btn-premium' 
              : 'text-white border border-white/20 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('payments')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
          </svg>
          <span>Payment Submissions ({paymentSubmissions.filter(p => p.status === 'pending').length})</span>
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeTab === 'users' 
              ? 'btn-premium' 
              : 'text-white border border-white/20 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>All Users ({users.length})</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center text-gray-300 py-8">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading admin data...
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'payments' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            Pending Payments
          </h3>
          {paymentSubmissions.filter(p => p.status === 'pending').map(payment => (
            <div key={payment.id} className="glass-effect p-6">
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

      {!isLoading && activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            All Users
          </h3>
          {users.map(user => (
            <div key={user.id} className="glass-effect p-6">
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