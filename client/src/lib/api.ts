const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  async register(email: string, password: string, phone: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, phone })
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async verifyToken() {
    return this.request<{ user: any }>('/auth/verify');
  }

  async getUsers() {
    return this.request<any[]>('/users');
  }

  async grantPremium(userId: string) {
    return this.request<any>(`/users/${userId}/grant-premium`, {
      method: 'POST'
    });
  }

  async revokePremium(userId: string) {
    return this.request<any>(`/users/${userId}/revoke-premium`, {
      method: 'POST'
    });
  }

  async submitPayment(email: string, phone: string) {
    return this.request<any>('/payments/submit', {
      method: 'POST',
      body: JSON.stringify({ email, phone })
    });
  }

  async getPayments() {
    return this.request<any[]>('/payments');
  }

  async approvePayment(paymentId: string) {
    return this.request<any>(`/payments/${paymentId}/approve`, {
      method: 'POST'
    });
  }
}

export const apiClient = new ApiClient(); 