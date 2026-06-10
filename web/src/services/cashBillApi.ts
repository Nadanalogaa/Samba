const BASE = 'http://localhost:3001/api/cash';

function getToken() {
  return localStorage.getItem('cash-bill-token') || '';
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('cash-bill-token');
    localStorage.removeItem('cash-bill-user');
    window.location.href = '/cash-bill/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.headers.get('content-type')?.includes('application/pdf')) {
    return res.blob();
  }
  return res.json();
}

// Auth
export const cashAuth = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
};

// Rate Master
export const rateMasterApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/rate-master${q}`);
  },
  get: (id: number) => request(`/rate-master/${id}`),
  create: (data: any) => request('/rate-master', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/rate-master/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/rate-master/${id}`, { method: 'DELETE' }),
  standards: () => request('/rate-master/standards'),
};

// Customer Master
export const customerApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/customers${q}`);
  },
  get: (id: number) => request(`/customers/${id}`),
  create: (data: any) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Orders
export const orderApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/orders${q}`);
  },
  get: (id: number) => request(`/orders/${id}`),
  create: (data: any) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateItems: (id: number, data: any) => request(`/orders/${id}/items`, { method: 'PUT', body: JSON.stringify(data) }),
  generateBill: (id: number) => request(`/orders/${id}/generate-bill`, { method: 'POST' }),
};

// Bills
export const billApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/bills${q}`);
  },
  pdf: (id: number) => request(`/bills/${id}/pdf`),
};

// Reports
export const reportApi = {
  dashboard: () => request('/reports/dashboard'),
  dayEnd: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/reports/day-end${q}`);
  },
  billList: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/reports/cash-bill-list${q}`);
  },
  customerWise: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/reports/customer-wise${q}`);
  },
  bookWise: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/reports/book-wise${q}`);
  },
  districtComparison: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/reports/district-comparison${q}`);
  },
};

// Config
export const configApi = {
  discounts: () => request('/config/discounts'),
  updateDiscount: (code: string, data: any) => request(`/config/discounts/${code}`, { method: 'PUT', body: JSON.stringify(data) }),
  districts: () => request('/config/districts'),
  company: () => request('/config/company'),
};
