import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoBatches, demoFarmer } from '../demo/demoData';

const statusConfig = {
  harvested: { label: 'Harvested', cls: 'bg-yellow-100 text-yellow-700' },
  in_transit: { label: 'In Transit', cls: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', cls: 'bg-orange-100 text-orange-700' },
  packaged: { label: 'Packaged', cls: 'bg-green-100 text-green-700' },
  verified: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

export default function DemoFarmerDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState(demoBatches);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    batch_id: `BATCH-00${demoBatches.length + 1}`,
    product_name: '', origin: '', harvest_date: '', quantity: '', unit: 'kg',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newBatch = {
      id: batches.length + 1, ...form, status: 'harvested',
      is_verified: true, liveness_verified: true,
      farmer_name: demoFarmer.name, events: [
        { type: 'HARVESTED', location: form.origin, timestamp: new Date().toLocaleString() }
      ],
    };
    setBatches([...batches, newBatch]);
    setSuccess('✅ Batch registered successfully!');
    setShowForm(false);
    setTimeout(() => setSuccess(''), 3000);
  }

  function logout() {
    localStorage.removeItem('demoUser');
    navigate('/demo');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-green-700">🌿 Cultivar</h1>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Demo Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">Ravi Kumar 🌱</p>
            <p className="text-xs text-yellow-500">⭐ {demoFarmer.rating} ({demoFarmer.totalReviews} reviews)</p>
          </div>
          <button onClick={logout} className="text-xs text-red-500 hover:underline">Exit</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Harvests</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 active:scale-95"
          >
            {showForm ? 'Cancel' : '+ New Harvest'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-5 mb-5">
            <h3 className="font-semibold text-gray-800 mb-4">Register New Harvest</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
              {[
                { name: 'batch_id', label: 'Batch ID' },
                { name: 'product_name', label: 'Product Name' },
                { name: 'origin', label: 'Origin / Farm Location' },
                { name: 'harvest_date', label: 'Harvest Date', type: 'date' },
                { name: 'quantity', label: 'Quantity', type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input name={f.name} type={f.type || 'text'} value={form[f.name]}
                    onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="liters">liters</option>
                </select>
              </div>
              <button type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 mt-2">
                Submit Harvest
              </button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Batch ID</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Origin</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">✓</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{b.batch_id}</td>
                  <td className="px-4 py-3 font-medium">{b.product_name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{b.origin}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{b.harvest_date}</td>
                  <td className="px-4 py-3">{b.quantity} {b.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[b.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                      {statusConfig[b.status]?.label || b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{b.is_verified ? '✅' : '⚠️'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
