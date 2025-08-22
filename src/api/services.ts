import apiClient, { ApiResponse } from './client';

// Type definitions matching backend models
export interface BillItem {
  item_id: string;
  category: string;
  subtype: string;
  description: string;
  amount: number;
  unit_price: number;
  quantity: number;
  tax_rate: number;
  created_at: string;
}

export interface Bill {
  bill_id: string;
  user_id: number;
  period_start: string;
  period_end: string;
  issue_date: string;
  total_amount: number;
  subtotal: number;
  taxes: number;
  currency: string;
}

export interface BillData {
  bill: Bill;
  items: BillItem[];
  summary: {
    subtotal: number;
    taxes: number;
    total: number;
    item_count: number;
  };
}

export interface BillHistoryItem {
  period: string;
  total_amount: number;
  change_percent: number;
  issue_date: string;
  bill_id: string;
}

export interface AvailablePeriod {
  period: string;
  period_start: string;
  period_end: string;
  issue_date: string;
  total_amount: number;
  bill_id: string;
}

export interface BillDetails {
  bill: {
    bill_id: string;
    user_id: number;
    period_start: string;
    period_end: string;
    issue_date: string;
    total_amount: number;
    subtotal: number;
    taxes: number;
    currency: string;
  };
  items: BillItem[];
  summary: {
    subtotal: number;
    taxes: number;
    total: number;
    item_count: number;
  };
  breakdown: Record<
    string,
    {
      total: number;
      items: Array<{
        description: string;
        amount: number;
        quantity: number;
        unit_price: number;
        subtype: string;
        created_at: string;
      }>;
      percentage: number;
    }
  >;
  usage_stats: {
    total_gb: number;
    total_minutes: number;
    total_sms: number;
    roaming_mb: number;
    premium_sms_count: number;
    vas_count: number;
  };
}

export interface User {
  user_id: number;
  name: string;
  msisdn: string;
  type: 'postpaid' | 'prepaid';
  current_plan: {
    plan_id: number;
    plan_name: string;
    monthly_price: number;
    quota_gb: number;
  } | null;
  active_vas_count: number;
  active_addons_count: number;
}

export interface UserDetails {
  user_id: number;
  name: string;
  msisdn: string;
  type: 'postpaid' | 'prepaid';
  current_plan: {
    plan_id: number;
    plan_name: string;
    quota_gb: number;
    quota_min: number;
    quota_sms: number;
    monthly_price: number;
    overage_gb: number;
    overage_min: number;
    overage_sms: number;
  } | null;
  active_vas: Array<{
    vas_id: string;
    name: string;
    monthly_fee: number;
    provider: string;
    category: string;
  }>;
  active_addons: Array<{
    addon_id: number;
    name: string;
    type: string;
    price: number;
    extra_gb: number;
    extra_min: number;
    extra_sms: number;
  }>;
  account_summary: {
    total_monthly_cost: number;
    services_count: number;
    created_at: string;
    updated_at: string;
  };
}

export interface UserProfile {
  user_info: {
    user_id: number;
    name: string;
    msisdn: string;
    account_type: 'postpaid' | 'prepaid';
  };
  current_plan: {
    name: string;
    monthly_price: number;
    quotas: {
      data_gb: number;
      voice_min: number;
      sms_count: number;
    };
  } | null;
  services: {
    vas_count: number;
    addon_count: number;
  };
  membership: {
    member_since: string;
    last_updated: string;
  };
}

export interface UserStats {
  total_users: number;
  user_types: {
    postpaid: number;
    postpaid_percentage: string;
    prepaid: number;
    prepaid_percentage: string;
  };
  service_adoption: {
    vas_users: number;
    vas_adoption_rate: string;
    addon_users: number;
    addon_adoption_rate: string;
  };
  analysis_date: string;
}

export interface Plan {
  plan_id: number;
  plan_name: string;
  type: 'postpaid' | 'prepaid';
  monthly_price: number;
  quota_gb: number;
  quota_min: number;
  quota_sms: number;
  overage_gb: number;
  overage_min: number;
  overage_sms: number;
  features: string[];
}

export interface Addon {
  addon_id: number;
  name: string;
  type: string;
  price: number;
  extra_gb: number;
  extra_min: number;
  extra_sms: number;
  description: string;
}

export interface VAS {
  vas_id: string;
  name: string;
  monthly_fee: number;
  provider: string;
  category: string;
  description: string;
  rating: number;
}

export interface PremiumSMS {
  shortcode: string;
  service_name: string;
  provider: string;
  price: number;
  category: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface CatalogStats {
  total_plans: number;
  total_addons: number;
  total_vas: number;
  total_premium_sms: number;
  price_ranges: {
    plans: { min: number; max: number };
    addons: { min: number; max: number };
    vas: { min: number; max: number };
  };
}

export interface Anomaly {
  category: string;
  delta: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface AnomalyAnalysis {
  anomalies: Anomaly[];
  risk_score: number;
  recommendations: string[];
  period: string;
  user_id: number;
}

export interface WhatIfScenario {
  scenario_id?: string;
  name?: string;
  changes?: {
    plan_change?: {
      from: number;
      to: number;
    };
    addons?: number[];
    vas_services?: string[];
  };
  new_total: number;
  saving: number;
  saving_percentage: string;
  // Backend response fields
  current_total?: number;
  saving_percent?: string;
  details?: string[];
  recommendations?: string[];
  scenario_summary?: string;
  effective_date?: string;
  breakdown?: any;
  risk_factors?: string[];
}

export interface CheckoutEstimate {
  estimated_total: number;
  breakdown: {
    plan_cost: number;
    addons_cost: number;
    vas_cost: number;
    taxes: number;
  };
  savings: number;
  recommendations: string[];
}

export interface Order {
  order_id: string;
  user_id: number;
  items: Array<{
    type: 'plan' | 'addon' | 'vas';
    id: number | string;
    name: string;
    price: number;
  }>;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  estimated_completion: string;
}

// API Service Functions
export const apiService = {
  // Bill Services
  async getBill(
    userId: number,
    period?: string,
    includeItems: boolean = true,
  ): Promise<BillData> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    params.append('include_items', includeItems.toString());

    const response = await apiClient.get<ApiResponse<BillData>>(
      `/bills/${userId}?${params}`,
    );
    return response.data.data;
  },

  async getBillHistory(
    userId: number,
    months: number = 6,
  ): Promise<BillHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<BillHistoryItem[]>>(
      `/bills/${userId}/history?months=${months}`,
    );
    return response.data.data;
  },

  async getBillDetails(billId: string): Promise<BillDetails> {
    const response = await apiClient.get<ApiResponse<BillDetails>>(
      `/bills/details/${billId}`,
    );
    return response.data.data;
  },

  async getAvailablePeriods(userId: number): Promise<AvailablePeriod[]> {
    const response = await apiClient.get<ApiResponse<AvailablePeriod[]>>(
      `/bills/${userId}/available-periods`,
    );
    return response.data.data.available_periods;
  },

  // User Services
  async getAllUsers(
    type?: 'postpaid' | 'prepaid',
    limit: number = 50,
  ): Promise<User[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit.toString());

    const response = await apiClient.get<ApiResponse<User[]>>(
      `/users?${params}`,
    );
    return response.data.data;
  },

  async getUserById(userId: number): Promise<UserDetails> {
    const response = await apiClient.get<ApiResponse<UserDetails>>(
      `/users/${userId}`,
    );
    return response.data.data;
  },

  async getUserByMsisdn(msisdn: string): Promise<UserDetails> {
    const response = await apiClient.get<ApiResponse<UserDetails>>(
      `/users/by-msisdn/${msisdn}`,
    );
    return response.data.data;
  },

  async getUserProfile(userId: number): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      `/users/${userId}/profile`,
    );
    return response.data.data;
  },

  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>(
      '/users/stats',
    );
    return response.data.data;
  },

  // Catalog Services
  async getAllCatalog(type?: 'postpaid' | 'prepaid'): Promise<any> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const response = await apiClient.get<ApiResponse<any>>(
      `/catalog?${params}`,
    );
    return response.data.data;
  },

  async getCatalogStats(): Promise<CatalogStats> {
    const response = await apiClient.get<ApiResponse<CatalogStats>>(
      '/catalog/stats',
    );
    return response.data.data;
  },

  async getPlans(
    type?: 'postpaid' | 'prepaid',
    minPrice?: number,
    maxPrice?: number,
    minGb?: number,
    sort?: 'price_asc' | 'price_desc' | 'gb_asc' | 'gb_desc',
  ): Promise<Plan[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (minPrice !== undefined) params.append('min_price', minPrice.toString());
    if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());
    if (minGb !== undefined) params.append('min_gb', minGb.toString());
    if (sort) params.append('sort', sort);

    const response = await apiClient.get<ApiResponse<Plan[]>>(
      `/catalog/plans?${params}`,
    );
    return response.data.data;
  },

  async getPlanDetails(planId: number): Promise<Plan> {
    const response = await apiClient.get<ApiResponse<Plan>>(
      `/catalog/plans/${planId}`,
    );
    return response.data.data;
  },

  async getAddons(
    planId?: number,
    type?: string,
    maxPrice?: number,
    sort?: 'price_asc' | 'price_desc',
  ): Promise<Addon[]> {
    const params = new URLSearchParams();
    if (planId !== undefined) params.append('plan_id', planId.toString());
    if (type) params.append('type', type);
    if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());
    if (sort) params.append('sort', sort);

    const response = await apiClient.get<ApiResponse<Addon[]>>(
      `/catalog/addons?${params}`,
    );
    return response.data.data;
  },

  async getVAS(
    category?: string,
    maxPrice?: number,
    minRating?: number,
  ): Promise<VAS[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());
    if (minRating !== undefined)
      params.append('min_rating', minRating.toString());

    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/catalog/vas?${params}`,
      );

      console.log('🔍 getVAS - Raw response:', response);
      console.log('🔍 getVAS - response.data:', response.data);
      console.log('🔍 getVAS - response.data.data:', response.data.data);
      console.log(
        '🔍 getVAS - response.data.data?.services:',
        response.data.data?.services,
      );
      console.log(
        '🔍 getVAS - Type of services:',
        typeof response.data.data?.services,
      );
      console.log(
        '🔍 getVAS - Is Array:',
        Array.isArray(response.data.data?.services),
      );

      // Backend returns { services: VAS[], grouped_by_category: {...}, categories: [...] }
      // We need to extract the services array
      const services = response.data.data?.services || [];
      console.log('🔍 getVAS - Final services array:', services);

      return services;
    } catch (error) {
      console.error('❌ getVAS Error:', error);
      return [];
    }
  },

  async getPremiumSMS(
    category?: string,
    maxPrice?: number,
    riskLevel?: 'low' | 'medium' | 'high',
  ): Promise<PremiumSMS[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());
    if (riskLevel) params.append('risk_level', riskLevel);

    const response = await apiClient.get<ApiResponse<PremiumSMS[]>>(
      `/catalog/premium-sms?${params}`,
    );
    return response.data.data;
  },

  async getRecommendations(userId: number, preferences: any): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/catalog/recommendations',
      {
        user_id: userId,
        ...preferences,
      },
    );
    return response.data.data;
  },

  // Anomaly Services
  async detectAnomalies(
    userId: number,
    period: string,
  ): Promise<AnomalyAnalysis> {
    const response = await apiClient.post<ApiResponse<AnomalyAnalysis>>(
      '/anomalies',
      {
        user_id: userId,
        period,
      },
    );
    return response.data.data;
  },

  async getDetailedAnalysis(
    userId: number,
    period: string,
  ): Promise<AnomalyAnalysis> {
    const response = await apiClient.post<ApiResponse<AnomalyAnalysis>>(
      '/anomalies/detailed',
      {
        user_id: userId,
        period,
      },
    );
    return response.data.data;
  },

  async getAnomalyHistory(userId: number): Promise<AnomalyAnalysis[]> {
    const response = await apiClient.get<ApiResponse<AnomalyAnalysis[]>>(
      `/anomalies/history/${userId}`,
    );
    return response.data.data;
  },

  // What-If Services
  async calculateWhatIf(
    userId: number,
    period: string,
    scenario: any,
  ): Promise<WhatIfScenario> {
    console.log('🚀 apiService.calculateWhatIf - Sending request:', {
      user_id: userId,
      period,
      scenario,
    });

    const response = await apiClient.post<ApiResponse<WhatIfScenario>>(
      '/whatif',
      {
        user_id: userId,
        period,
        scenario, // Send scenario as a separate object
      },
    );

    console.log(
      '✅ apiService.calculateWhatIf - Response received:',
      response.data,
    );
    return response.data.data;
  },

  async compareScenarios(
    userId: number,
    period: string,
    scenarios: any[],
  ): Promise<WhatIfScenario[]> {
    const response = await apiClient.post<ApiResponse<WhatIfScenario[]>>(
      '/whatif/compare',
      {
        user_id: userId,
        period,
        scenarios,
      },
    );
    return response.data.data;
  },

  // Checkout Services
  async estimatePrice(userId: number, items: any[]): Promise<CheckoutEstimate> {
    const response = await apiClient.post<ApiResponse<CheckoutEstimate>>(
      '/checkout/estimate',
      {
        user_id: userId,
        items,
      },
    );
    return response.data.data;
  },

  async getOrderHistory(
    userId: number,
    limit: number = 10,
    status?: string,
  ): Promise<Order[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await apiClient.get<ApiResponse<Order[]>>(
      `/checkout/history/${userId}?${params}`,
    );
    return response.data.data;
  },

  async processCheckout(userId: number, actions: any[]): Promise<Order> {
    console.log('🚀 apiService.processCheckout - Sending request:', {
      user_id: userId,
      actions,
    });

    const response = await apiClient.post<ApiResponse<Order>>('/checkout', {
      user_id: userId,
      actions,
    });

    console.log(
      '✅ apiService.processCheckout - Response received:',
      response.data,
    );
    return response.data.data;
  },

  async getOrderStatus(orderId: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/checkout/${orderId}`,
    );
    return response.data.data;
  },

  async cancelOrder(
    orderId: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ success: boolean; message: string }>
    >(`/checkout/${orderId}`);
    return response.data.data;
  },

  // Explanation Services
  async explainBill(userId: number, period: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/explain', {
      user_id: userId,
      period,
    });
    return response.data.data;
  },

  async explainUsage(
    userId: number,
    period: string,
    category: string,
  ): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/explain/usage/${category}`,
      {
        user_id: userId,
        period,
      },
    );
    return response.data.data;
  },

  async explainCosts(userId: number, period: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/explain/costs', {
      user_id: userId,
      period,
    });
    return response.data.data;
  },
};

export default apiService;
