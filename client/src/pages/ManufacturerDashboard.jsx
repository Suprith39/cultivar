import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';

const STATUSES = ['harvested', 'processing', 'packaged'];

const statusColors = {
  harvested: 'bg-green-100 text-green-700',
  processing: 'bg-yellow-100 text-yellow-700',
  packaged: 'bg-blue-100 text-blue-700',
};

export default function ManufacturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [batch, setBatch] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBatch(null);
    setLoading(true);
    try {
      const res = await api.get(`/batches/${searchId.trim()}`);
      setBatch(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Batch not found.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const res = await api.patch(`/batches/${batch.batch_id}/status`, { status: newStatus });
      setBatch(res.data);
      setSuccess('Status updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manufacturer Dashboard</h2>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Enter Batch ID (e.g. BATCH-001)"
            required
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        {batch && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{batch.batch_id}</h3>
              {batch.qr_code && (
                <img
                  src={batch.qr_code}
                  alt="QR"
                  className="w-16 h-16 cursor-pointer hover:opacity-75"
                  onClick={() => setSelectedQR({ qrCode: batch.qr_code, batchId: batch.batch_id })}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div>
                <p className="text-gray-500">Product</p>
                <p className="font-medium">{batch.product_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Origin</p>
                <p className="font-medium">{batch.origin}</p>
              </div>
              <div>
                <p className="text-gray-500">Harvest Date</p>
                <p className="font-medium">{new Date(batch.harvest_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Quantity</p>
                <p className="font-medium">{batch.quantity} {batch.unit}</p>
              </div>
              <div>
                <p className="text-gray-500">Farmer</p>
                <p className="font-medium">{batch.farmer_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Current Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize font-medium ${statusColors[batch.status] || 'bg-gray-100 text-gray-700'}`}>
                  {batch.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === batch.status}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedQR && (
        <QRModal
          qrCode={selectedQR.qrCode}
          batchId={selectedQR.batchId}
          onClose={() => setSelectedQR(null)}
        />
      )}
    </div>
  );
}
