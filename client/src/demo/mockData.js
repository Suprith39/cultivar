export const DEMO_USERS = [
  { id: 1, name: 'Ravi Kumar', email: 'farmer@demo.com', password: 'demo123', role: 'farmer' },
  { id: 2, name: 'Priya Sharma', email: 'manufacturer@demo.com', password: 'demo123', role: 'manufacturer' },
  { id: 3, name: 'Amit Singh', email: 'consumer@demo.com', password: 'demo123', role: 'consumer' },
  { id: 4, name: 'Logistics Co', email: 'logistics@demo.com', password: 'demo123', role: 'logistics_agent' },
];

export const DEMO_BATCHES = [
  {
    id: 1, batch_id: 'BATCH-001', product_name: 'Ashwagandha', origin: 'Assam, India',
    harvest_date: '2026-03-15', quantity: 50, unit: 'kg', status: 'verified',
    farmer_name: 'Ravi Kumar', farmer_email: 'farmer@demo.com', farmer_id: 1,
    is_verified: true, liveness_verified: true, ai_confidence: 87.4,
    qr_code: null, farm_photo: null, crop_photo: null,
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 2, batch_id: 'BATCH-002', product_name: 'Turmeric', origin: 'Kerala, India',
    harvest_date: '2026-03-18', quantity: 30, unit: 'kg', status: 'harvested',
    farmer_name: 'Ravi Kumar', farmer_email: 'farmer@demo.com', farmer_id: 1,
    is_verified: true, liveness_verified: true, ai_confidence: null,
    qr_code: null, farm_photo: null, crop_photo: null,
    created_at: '2026-03-18T09:00:00Z',
  },
  {
    id: 3, batch_id: 'BATCH-003', product_name: 'Neem Leaves', origin: 'Tamil Nadu, India',
    harvest_date: '2026-03-20', quantity: 20, unit: 'kg', status: 'processing',
    farmer_name: 'Ravi Kumar', farmer_email: 'farmer@demo.com', farmer_id: 1,
    is_verified: false, liveness_verified: false, ai_confidence: null,
    qr_code: null, farm_photo: null, crop_photo: null,
    created_at: '2026-03-20T08:00:00Z',
  },
];

export const DEMO_TOKEN = 'demo-jwt-token';

export function demoLogin(email, password) {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  if (!user) return null;
  return { token: DEMO_TOKEN + '-' + user.role, user: { id: user.id, name: user.name, role: user.role } };
}

export function demoRegister(name, email, password, role) {
  return { token: DEMO_TOKEN + '-' + role, user: { id: 99, name, role } };
}
