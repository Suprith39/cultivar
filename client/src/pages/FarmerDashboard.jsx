import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import HarvestEntryForm from '../components/HarvestEntryForm';

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  function handleFormSuccess() {
    setShowForm(false);
    fetchBatches();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Harvests</h2>
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showForm ? 'Cancel' : '+ New Harvest'}
          </button>
        </div>

        {showForm && <HarvestEntryForm onSuccess={handleFormSuccess} />}

        {loading ? (
          <p className="text-gray-500">Loading batches...</p>
        ) : batches.length === 0 ? (
          <p className="text-gray-500">No batches yet. Add your first harvest above.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Batch ID</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Origin</th>
                  <th className="px-4 py-3 text-left">Harvest Date</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{b.batch_id}</td>
                    <td className="px-4 py-3">{b.product_name}</td>
                    <td className="px-4 py-3">{b.origin}</td>
                    <td className="px-4 py-3">{new Date(b.harvest_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{b.quantity} {b.unit}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs capitalize">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
