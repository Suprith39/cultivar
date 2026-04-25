import axios from 'axios';
import { demoLogin, demoRegister, DEMO_BATCHES } from '../demo/mockData';

const BACKEND_URL = process.env.REACT_APP_API_URL || '';
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

const api = axios.create({
  baseURL: BACKEND_URL ? `${BACKEND_URL}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Demo mode interceptor — returns mock data if REACT_APP_DEMO_MODE=true
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!DEMO_MODE) return Promise.reject(error);

    const { config } = error;
    const url = config?.url || '';
    const method = config?.method?.toLowerCase();

    // Auth
    if (url.includes('/auth/login') && method === 'post') {
      const body = JSON.parse(config.data || '{}');
      const result = demoLogin(body.email, body.password);
      if (result) return { data: result };
      return Promise.reject({ response: { data: { message: 'Invalid credentials.' } } });
    }
    if (url.includes('/auth/register') && method === 'post') {
      const body = JSON.parse(config.data || '{}');
      const result = demoRegister(body.name, body.email, body.password, body.role);
      return { data: result };
    }

    // Batches
    if (url.includes('/batches/all') && method === 'get') {
      return { data: DEMO_BATCHES };
    }
    if (url.match(/\/batches\/next-id/) && method === 'get') {
      return { data: { batchId: `BATCH-00${DEMO_BATCHES.length + 1}` } };
    }
    if (url.match(/\/batches$/) && method === 'get') {
      return { data: DEMO_BATCHES };
    }
    if (url.match(/\/batches$/) && method === 'post') {
      const body = JSON.parse(config.data || '{}');
      const newBatch = { id: 99, ...body, status: 'harvested', farmer_name: 'Demo Farmer', created_at: new Date().toISOString() };
      DEMO_BATCHES.push(newBatch);
      return { data: newBatch };
    }
    if (url.match(/\/batches\/\d+\/analyze/) && method === 'post') {
      return { data: { detectedSpecies: 'Turmeric', confidenceScore: 82.5, isAgricultural: true, topPredictions: [{ label: 'turmeric', score: 82.5 }] } };
    }
    if (url.match(/\/batches\/verify\/\d+/) && method === 'put') {
      return { data: { ...DEMO_BATCHES[0], status: 'verified' } };
    }

    // Verify public
    if (url.match(/\/verify\//) && method === 'get') {
      const batchId = url.split('/verify/')[1];
      const batch = DEMO_BATCHES.find(b => b.batch_id === batchId) || DEMO_BATCHES[0];
      return { data: { ...batch, events: [] } };
    }

    // Ratings
    if (url.includes('/ratings/check/') && method === 'get') {
      return { data: { rated: false } };
    }
    if (url.includes('/ratings/submit') && method === 'post') {
      return { data: { message: 'Review submitted.' } };
    }
    if (url.match(/\/ratings\/farmer\//) && method === 'get') {
      return { data: { average: 4.2, total: 3, distribution: { 5: 1, 4: 2, 3: 0, 2: 0, 1: 0 }, reviews: [] } };
    }

    // Logistics
    if (url.includes('/logistics/last-location/') && method === 'get') {
      return { data: { place_name: 'Mumbai, India', lat: 19.076, lng: 72.877, timestamp: new Date().toISOString() } };
    }
    if (url.includes('/logistics/update-location') && method === 'post') {
      return { data: { message: 'Location updated.', event: { place_name: 'Demo Location', timestamp: new Date().toISOString() } } };
    }

    return Promise.reject(error);
  }
);

export default api;
