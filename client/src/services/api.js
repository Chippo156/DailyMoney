const BASE_URL = '/api';

export async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Lỗi yêu cầu: ${res.statusText}`);
  }
  return data;
}

export const api = {
  // Giao dịch
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return fetchJson(`/transactions?${query.toString()}`);
  },
  createTransaction: (data) => fetchJson('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id, data) => fetchJson(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id) => fetchJson(`/transactions/${id}`, { method: 'DELETE' }),

  // Danh mục
  getCategories: (type) => fetchJson(`/categories${type ? `?type=${type}` : ''}`),
  createCategory: (data) => fetchJson('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => fetchJson(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => fetchJson(`/categories/${id}`, { method: 'DELETE' }),

  // Thống kê & Báo cáo
  getOverviewStats: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchJson(`/stats/overview?${query.toString()}`);
  },
  getCategoryStats: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchJson(`/stats/by-category?${query.toString()}`);
  },
  getTrendStats: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchJson(`/stats/trend?${query.toString()}`);
  },
  getPaymentMethodStats: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchJson(`/stats/payment-methods?${query.toString()}`);
  },

  // Ngân sách
  getBudgets: (month) => fetchJson(`/budgets?month=${month}`),
  saveBudget: (data) => fetchJson('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  deleteBudget: (id) => fetchJson(`/budgets/${id}`, { method: 'DELETE' }),

  // Dữ liệu
  seedSampleData: () => fetchJson('/data/seed-sample', { method: 'POST' }),
  clearTransactions: () => fetchJson('/data/clear-transactions', { method: 'POST' }),
  getExportUrl: () => `${BASE_URL}/data/export`,
};
