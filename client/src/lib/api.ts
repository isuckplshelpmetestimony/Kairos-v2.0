import { API_BASE_URL } from '../config';
import type { CompaniesResponse, CompanyDetailsResponse, ChatResponse } from '../../../shared/schema';

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
    return this.request<any>('/users/grant-premium', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  async revokePremium(userId: string) {
    return this.request<any>('/users/revoke-premium', {
      method: 'POST',
      body: JSON.stringify({ userId })
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
    return this.request<any>('/payments/approve', {
      method: 'POST',
      body: JSON.stringify({ paymentId })
    });
  }

  async rejectPayment(paymentId: string) {
    return this.request<any>('/payments/reject', {
      method: 'POST',
      body: JSON.stringify({ paymentId })
    });
  }

  /**
   * Fetch a paginated, filterable list of crisis companies
   * @param params Query params: industry, crisis_category, crisis_score_min, crisis_score_max, limit, offset, sort_by, sort_order
   */
  async getCrisisCompanies(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<CompaniesResponse>(`/crisis/companies?${query}`);
  }

  /**
   * Fetch detailed profile for a crisis company
   * @param companyId The company ID
   */
  async getCrisisCompanyDetails(companyId: number) {
    return this.request<CompanyDetailsResponse>(`/crisis/companies/${companyId}`);
  }

  /**
   * Send a chat message to the crisis AI for a company
   * @param companyId The company ID
   * @param message The user's question
   * @param contextPreferences (optional) User context preferences
   */
  async postCrisisChatMessage(companyId: number, message: string, contextPreferences: Record<string, any> = {}) {
    return this.request<ChatResponse>(`/crisis/chat/${companyId}`, {
      method: 'POST',
      body: JSON.stringify({ message, context_preferences: contextPreferences })
    });
  }

  /**
   * Proxy a request to Firecrawl via the backend
   * @param endpoint The Firecrawl API endpoint (e.g., '/scrape')
   * @param method HTTP method (default: 'POST')
   * @param data Request body (default: {})
   * @param params Query params (default: {})
   */
  async firecrawlProxy<T>(endpoint: string, method: string = 'POST', data: any = {}, params: any = {}) {
    return this.request<T>('/firecrawl/proxy', {
      method: 'POST',
      body: JSON.stringify({ endpoint, method, data, params })
    });
  }
}

export const apiClient = new ApiClient(); 