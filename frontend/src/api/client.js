const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch (e) {
      errorDetail = response.statusText;
    }
    const err = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),
  updatePreferences: (data) => apiRequest('/auth/preferences', { method: 'PUT', body: JSON.stringify(data) }),

  // Products
  getCategories: () => apiRequest('/products/categories'),
  getProducts: (params = '') => apiRequest(`/products${params}`),
  getProductDetail: (id) => apiRequest(`/products/${id}`),
  getCompareSelector: (catId) => apiRequest(`/products/compare-selector${catId ? `?category_id=${catId}` : ''}`),

  // Search & Interactions
  search: (params = '') => apiRequest(`/search${params}`),
  logInteraction: (data) => apiRequest('/interactions', { method: 'POST', body: JSON.stringify(data) }),

  // Compare
  compare: (data) => apiRequest('/compare', { method: 'POST', body: JSON.stringify(data) }),

  // Recommendations
  getRecommendations: (token) => apiRequest(`/recommendations${token ? `?token=${token}` : ''}`),

  // Reviews
  getProductReviews: (productId) => apiRequest(`/reviews/product/${productId}`),
  createReview: (data) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Location & Addresses
  reverseGeocode: (coords) => apiRequest('/location/reverse-geocode', { method: 'POST', body: JSON.stringify(coords) }),
  checkServiceability: (pin) => apiRequest(`/location/serviceability/${pin}`),
  getAddresses: () => apiRequest('/addresses'),
  createAddress: (data) => apiRequest('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id) => apiRequest(`/addresses/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => apiRequest('/cart'),
  addToCart: (data) => apiRequest('/cart/items', { method: 'POST', body: JSON.stringify(data) }),
  updateCartItem: (itemId, data) => apiRequest(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCartItem: (itemId) => apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/cart/clear', { method: 'DELETE' }),

  // Orders
  checkout: (data) => apiRequest('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => apiRequest('/orders'),
  getOrderDetail: (id) => apiRequest(`/orders/${id}`),

  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
  adminCreateProduct: (data) => apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id, data) => apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  getAdminServiceablePins: () => apiRequest('/admin/serviceable-pins'),
  addAdminServiceablePin: (data) => apiRequest('/admin/serviceable-pins', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminServiceablePin: (id) => apiRequest(`/admin/serviceable-pins/${id}`, { method: 'DELETE' }),
  getAdminOrders: () => apiRequest('/admin/orders'),
  updateAdminOrderStatus: (id, data) => apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  moderateDeleteReview: (id) => apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),
};
