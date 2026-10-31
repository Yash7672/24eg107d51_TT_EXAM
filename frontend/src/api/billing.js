import { api } from './api';

export const productApi = {
  list: () => api.get('/api/products'),
  get: (id) => api.get(`/api/products/${id}`),
  add: (data) => api.post('/api/products', data)
};

export const billApi = {
  calculate: (data) => api.post('/api/bills/calculate', data),
  create: (data) => api.post('/api/bills', data),
  list: () => api.get('/api/bills'),
  get: (id) => api.get(`/api/bills/${id}`)
};

export const customerApi = {
  list: () => api.get('/api/customers'),
  add: (data) => api.post('/api/customers', data)
};

export const reportApi = {
  dashboard: () => api.get('/api/reports/dashboard')
};
