export const demoFarmer = {
  id: 1, name: 'Ravi Kumar', email: 'ravi@farm.com', role: 'farmer', rating: 4.5, totalReviews: 24
};

export const demoConsumer = {
  id: 2, name: 'Priya Sharma', email: 'priya@gmail.com', role: 'consumer'
};

export const demoBatches = [
  {
    id: 1, batch_id: 'BATCH-001', product_name: 'Organic Tomatoes', origin: 'Mysuru Farm, Karnataka',
    harvest_date: '2026-04-20', quantity: 500, unit: 'kg', status: 'packaged',
    is_verified: true, liveness_verified: true, farm_photo: null, crop_photo: null,
    farmer_name: 'Ravi Kumar',
    events: [
      { type: 'HARVESTED', location: 'Mysuru Farm, Karnataka', timestamp: '2026-04-20 08:00 AM' },
      { type: 'IN_TRANSIT', location: 'Bangalore Highway, Karnataka', timestamp: '2026-04-21 10:30 AM' },
      { type: 'PROCESSING', location: 'FreshPack Factory, Bangalore', timestamp: '2026-04-22 02:00 PM' },
      { type: 'PACKAGED', location: 'FreshPack Factory, Bangalore', timestamp: '2026-04-23 09:00 AM' },
    ],
  },
  {
    id: 2, batch_id: 'BATCH-002', product_name: 'Fresh Spinach', origin: 'Hassan Farm, Karnataka',
    harvest_date: '2026-04-22', quantity: 200, unit: 'kg', status: 'in_transit',
    is_verified: true, liveness_verified: true, farm_photo: null, crop_photo: null,
    farmer_name: 'Ravi Kumar',
    events: [
      { type: 'HARVESTED', location: 'Hassan Farm, Karnataka', timestamp: '2026-04-22 07:00 AM' },
      { type: 'IN_TRANSIT', location: 'Mysore Road, Karnataka', timestamp: '2026-04-23 11:00 AM' },
    ],
  },
  {
    id: 3, batch_id: 'BATCH-003', product_name: 'Turmeric Root', origin: 'Coorg Estate, Karnataka',
    harvest_date: '2026-04-24', quantity: 150, unit: 'kg', status: 'harvested',
    is_verified: true, liveness_verified: true, farm_photo: null, crop_photo: null,
    farmer_name: 'Ravi Kumar',
    events: [
      { type: 'HARVESTED', location: 'Coorg Estate, Karnataka', timestamp: '2026-04-24 06:30 AM' },
    ],
  },
];

export const demoRatings = [
  { consumer_name: 'Priya Sharma', rating: 5, review: 'Fresh and organic! Exactly as described.', created_at: '2026-04-21' },
  { consumer_name: 'Amit Patel', rating: 4, review: 'Good quality produce. Will buy again.', created_at: '2026-04-22' },
  { consumer_name: 'Sneha Rao', rating: 5, review: 'Verified farm, trusted source. Excellent!', created_at: '2026-04-23' },
];
