import { api } from './api';

export const productApi = {
  list: () => api.get('/api/products'),
};

export const billApi = {
  calculate: (data) => api.post('/api/bills/calculate', data),
};
