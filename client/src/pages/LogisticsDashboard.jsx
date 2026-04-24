import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LocationCapture from '../components/LocationCapture';

export default function LogisticsDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [batchInput, setBatchInput] = useState('');
  const [batchInfo, setBatchInfo] = useState(null);
  const [batchError, setBatchError] = useState('');
  const [location, setLocation] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [lastEvent, setLastEvent] = useState(null);
  const [showCapture, setShowCapture] = useState(false);

  async function handleLoadBatch(e) {
    e.preventDefault();
    setBatchError('');
    setBatchInfo(null);
    setLastEvent(null);
    setUpdateMsg('');
    setUpdateError('');
    setShowCapture(false);
    try {
      const res = await api.get(`/logistics/last-location/${batchInput.trim()}`);
      setLastEvent(res.data);
    } catch {
      // no events yet is fine
    }
    try {
      const res = await api.get(`/api/verify/${batchInput.trim()}`);
      setBatchInfo(res.data);
    } catch {
      // fallback — try verify public endpoint via axios directly
      try {
        const { default: axios } = await import('axios');
        const res = await axios.get(`/api/verify/${batchInput.trim()}`);
        setBatchInfo(res.data);
      } catch {
        setBatchError('Batch not found.');
      }
    }
  }

  async function handleUpdateLocation() {
    if (!location) return;
    setUpdating(true);
    setUpdateMsg('');
    setUpdateError('');
    try {
      const res = await api.post('/logistics/update-location', {
        batchId: batchInput.trim(),
        location,
      });
      setUpdateMsg('✅ Location updated successfully');
      setLastEvent(res.data.event);
      // refresh batch info status
      if (batchInfo) setBatchInfo({ ...batchInfo, status: 'in_transit' });
    } catch (err) {
      setUpdateError(err.response?.data?.message || '❌ Invalid Batch ID or update failed');
    } finally {
      setUpdating(false);
    }
  }

  const mapsUrl = lastEvent?.lat && lastEvent?.lng
    ? `https://maps.google.com/?q=${lastEvent.lat},${lastEvent.lng}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Logistics Agent</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Logistics Dashboard</h2>

        {/* Batch Lookup */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Load Batch</h3>
          <form onSubmit={handleLoadBatch} className="flex gap-2">
            <input
              value={batchInput}
              onChange={e => setBatchInput(e.target.value)}
              placeholder="Enter Batch ID (e.g. BATCH-001)"
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" disabled={!batchInput.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
              Load Batch
            </button>
          </form>
          {batchError && <p className="text-red-500 text-sm mt-2">{batchError}</p>}

          {batchInfo && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">Product:</span> <span className="font-medium">{batchInfo.product_name}</span></p>
              <p><span className="text-gray-500">Status:</span> <span className="capitalize font-medium">{batchInfo.status}</span></p>
              <p><span className="text-gray-500">Origin:</span> {batchInfo.origin}</p>
              <p><span className="text-gray-500">Farmer:</span> {batchInfo.farmer_name}</p>
              {lastEvent && (
                <>
                  <p><span className="text-gray-500">Last Location:</span> {lastEvent.place_name || `${lastEvent.lat}, ${lastEvent.lng}`}</p>
                  <p><span className="text-gray-500">Last Updated:</span> {new Date(lastEvent.timestamp).toLocaleString()}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Location Capture */}
        {batchInfo && (
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h3 className="font-semibold text-gray-700">Update Location</h3>
            {!showCapture ? (
              <button
                onClick={() => setShowCapture(true)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                📍 Capture Location & Update
              </button>
            ) : (
              <>
                <LocationCapture onChange={setLocation} />
                {updateMsg && <p className="text-green-600 text-sm">{updateMsg}</p>}
                {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
                <button
                  onClick={handleUpdateLocation}
                  disabled={updating || !location}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {updating ? 'Updating...' : 'Submit Location Update'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Last Known Location Card */}
        {lastEvent && (
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Last Known Location</h3>
            <div className="space-y-2 text-sm">
              <p>📍 {lastEvent.place_name || `${lastEvent.lat}, ${lastEvent.lng}`}</p>
              <p>🕐 {new Date(lastEvent.timestamp).toLocaleString()}</p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
                  View on Google Maps ↗
                </a>
              )}
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                IN TRANSIT
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
