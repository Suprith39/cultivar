import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import HarvestEntryForm from '../components/HarvestEntryForm';
import QRModal from '../components/QRModal';
import ProofViewer from '../components/ProofViewer';
import FarmerRatingCard from '../components/FarmerRatingCard';
import { demoBatches, demoFarmer } from '../demo/demoData';

export default function FarmerDashboard() {
  const { user, logout, isDemo } = useAuth();
  const [ratingData, setRatingData] = useState(null);
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);

  const fetchBatches = useCallback(async () => {
    if (isDemo) {
      setBatches([...demoBatches]);
      setLoading(false);
      setRatingData({ average: demoFarmer.rating, total: demoFarmer.totalReviews, distribution: { 5: 15, 4: 7, 3: 2, 2: 0, 1: 0 }, reviews: [] });
      return;
    }
    try {
      const res = await api.get('/batches');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  useEffect(() => {
    if (user?.id) {
      api.get(`/ratings/farmer/${user.id}`)
        .then(r => setRatingData(r.data))
        .catch(() => {});
    }
  }, [user]);

  function handleFormSuccess(newBatch) {
    setShowForm(false);
    if (isDemo && newBatch) {
      setBatches(prev => [newBatch, ...prev]);
    } else {
      fetchBatches();
    }
  }

  const statusColors = {
    harvested: 'bg-green-100 text-green-700',
    processing: 'bg-yellow-100 text-yellow-700',
    packaged: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            Welcome, {user?.name}
            {ratingData?.total > 0 && (
              <span className="ml-2 text-yellow-500">⭐ {ratingData.average.toFixed(1)}</span>
            )}
          </span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Harvests</h2>
          <button onClick={() => setShowForm(v => !v)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
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
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">QR</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const hasPhotos = b.farm_photo && b.crop_photo;
                        const badge = b.is_verified ? '✅' : hasPhotos ? '⚠️' : '❌';
                        const title = b.is_verified ? 'Fully Verified' : hasPhotos ? 'Partially Verified' : 'Not Verified';
                        return (
                          <button
                            onClick={() => hasPhotos && setSelectedProof(b)}
                            className={hasPhotos ? 'cursor-pointer hover:opacity-75' : 'cursor-default'}
                            title={title}
                          >
                            {badge}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {b.qr_code ? (
                        <img src={b.qr_code} alt="QR" className="w-10 h-10 cursor-pointer hover:opacity-75"
                          onClick={() => setSelectedQR({ qrCode: b.qr_code, batchId: b.batch_id })} />
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedQR && (
        <QRModal qrCode={selectedQR.qrCode} batchId={selectedQR.batchId} onClose={() => setSelectedQR(null)} />
      )}
      {selectedProof && (
        <ProofViewer batch={selectedProof} onClose={() => setSelectedProof(null)} />
      )}

      {/* My Ratings Section */}
      {ratingData && (
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            My Ratings
            {ratingData.total > 0 && (
              <span className="ml-2 text-yellow-500 text-base font-normal">⭐ {ratingData.average.toFixed(1)} ({ratingData.total} review{ratingData.total !== 1 ? 's' : ''})</span>
            )}
          </h2>
          <FarmerRatingCard data={ratingData} />
        </div>
      )}
    </div>
  );
}
