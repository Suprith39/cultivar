import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';

const statusConfig = {
  harvested: { label: 'Harvested', cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700' },
  packaged: { label: 'Packaged', cls: 'bg-purple-100 text-purple-700' },
  in_transit: { label: 'In Transit', cls: 'bg-indigo-100 text-indigo-700' },
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

function ConfidenceBadge({ score }) {
  if (score == null) return <span className="text-gray-400 text-xs">—</span>;
  const num = parseFloat(score);
  if (isNaN(num)) return <span className="text-gray-400 text-xs">—</span>;
  const cls = num >= 75 ? 'text-green-600' : num >= 50 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-semibold text-sm ${cls}`}>{num.toFixed(1)}%</span>;
}

function ReviewModal({ batch, onClose, onRefresh }) {
  const { user } = useAuth();
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [productMatch, setProductMatch] = useState(false);
  const [qualityCheck, setQualityCheck] = useState(false);
  const [quantityCheck, setQuantityCheck] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  async function handleAnalyze() {
    setAnalyzing(true);
    setAiError('');
    setAiResult(null);
    try {
      const imageToSend = uploadedImage || batch.crop_photo || batch.farm_photo || null;
      const res = await api.post(`/batches/${batch.id}/analyze`, imageToSend ? { image: imageToSend } : {});
      setAiResult(res.data);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleDecision(action) {
    setSubmitting(true);
    try {
      await api.put(`/batches/verify/${batch.id}`, {
        productMatch: action === 'verify' ? productMatch : false,
        qualityCheck: action === 'verify' ? qualityCheck : false,
        quantityCheck: action === 'verify' ? quantityCheck : false,
        verificationNote: note,
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update batch.');
    } finally {
      setSubmitting(false);
    }
  }

  const canVerify = productMatch && qualityCheck && quantityCheck;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-white font-bold text-lg">Review Batch — {batch.batch_id}</h2>
          <button onClick={onClose} className="text-white hover:text-green-200 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Batch details */}
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4">
            <div><p className="text-gray-500">Farmer</p><p className="font-medium">{batch.farmer_name}</p></div>
            <div><p className="text-gray-500">Product</p><p className="font-medium">{batch.product_name}</p></div>
            <div><p className="text-gray-500">Origin</p><p className="font-medium">{batch.origin}</p></div>
            <div><p className="text-gray-500">Harvest Date</p><p className="font-medium">{new Date(batch.harvest_date).toLocaleDateString()}</p></div>
            <div><p className="text-gray-500">Quantity</p><p className="font-medium">{batch.quantity} {batch.unit}</p></div>
            <div><p className="text-gray-500">Status</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[batch.status]?.cls}`}>
                {statusConfig[batch.status]?.label || batch.status}
              </span>
            </div>
          </div>

          {/* Photos */}
          {(batch.farm_photo || batch.crop_photo) && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Farmer's Photos</p>
              <div className="grid grid-cols-2 gap-3">
                {batch.farm_photo && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Farm Photo</p>
                    <img src={batch.farm_photo} alt="farm" className="w-full rounded border max-h-40 object-cover" />
                  </div>
                )}
                {batch.crop_photo && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Crop Photo</p>
                    <img src={batch.crop_photo} alt="crop" className="w-full rounded border max-h-40 object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800">AI Image Analysis</p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : '🤖 Analyze Image with AI'}
              </button>
            </div>

            {/* Show existing photos or upload option */}
            {!batch.crop_photo && !batch.farm_photo && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">No photos from farmer. Upload an image to analyze:</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                {uploadedImage && (
                  <img src={uploadedImage} alt="upload preview" className="w-32 h-32 object-cover rounded border" />
                )}
              </div>
            )}

            {aiError && <p className="text-red-500 text-sm">{aiError}</p>}

            {aiResult && (
              <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Detected Species</span>
                  <span className="font-medium">{aiResult.detectedSpecies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence</span>
                  <ConfidenceBadge score={aiResult.confidenceScore} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agricultural Product</span>
                  <span className={aiResult.isAgricultural ? 'text-green-600 font-medium' : 'text-red-500'}>
                    {aiResult.isAgricultural ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Top Predictions</p>
                  {aiResult.topPredictions?.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600">
                      <span>{i + 1}. {p.label.replace(/_/g, ' ')}</span>
                      <span>{p.score.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 italic mt-2">⚠️ AI is a supporting tool only. Final decision is yours.</p>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-800">Verification Checklist</p>
            {[
              { label: 'Product matches description', value: productMatch, set: setProductMatch },
              { label: 'Quality is acceptable', value: qualityCheck, set: setQualityCheck },
              { label: 'Quantity is correct', value: quantityCheck, set: setQuantityCheck },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={value} onChange={e => set(e.target.checked)}
                  className="w-4 h-4 accent-green-600" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Add any notes about this batch..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleDecision('verify')}
              disabled={submitting || !canVerify}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 font-medium"
            >
              {submitting ? 'Processing...' : '✅ Verify Batch'}
            </button>
            <button
              onClick={() => handleDecision('reject')}
              disabled={submitting}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-40 font-medium"
            >
              ❌ Reject Batch
            </button>
          </div>
        </div>
      </div>

      {selectedQR && <QRModal qrCode={selectedQR.qrCode} batchId={selectedQR.batchId} onClose={() => setSelectedQR(null)} />}
    </div>
  );
}

export default function ManufacturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function fetchBatches() {
    try {
      const res = await api.get('/batches/all');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBatches(); }, []);

  const filtered = batches.filter(b => {
    const matchSearch = !searchId || b.batch_id.toLowerCase().includes(searchId.toLowerCase()) ||
      b.product_name.toLowerCase().includes(searchId.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker — Manufacturer</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">All Farmer Batches</h2>
          <div className="flex gap-2">
            <input value={searchId} onChange={e => setSearchId(e.target.value)}
              placeholder="Search batch or product..."
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Status</option>
              {Object.keys(statusConfig).map(s => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading batches...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No batches found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Batch ID</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Farmer</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">AI Score</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">QR</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.batch_id}</td>
                    <td className="px-4 py-3">{b.product_name}</td>
                    <td className="px-4 py-3">
                      <p>{b.farmer_name}</p>
                      <p className="text-xs text-gray-400">{b.farmer_email}</p>
                    </td>
                    <td className="px-4 py-3">{b.quantity} {b.unit}</td>
                    <td className="px-4 py-3"><ConfidenceBadge score={b.ai_confidence} /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[b.status]?.cls || 'bg-gray-100 text-gray-700'}`}>
                        {statusConfig[b.status]?.label || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.qr_code ? (
                        <img src={b.qr_code} alt="QR" className="w-10 h-10 cursor-pointer hover:opacity-75"
                          onClick={() => setSelectedQR({ qrCode: b.qr_code, batchId: b.batch_id })} />
                      ) : <span className="text-gray-400 text-xs">N/A</span>}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'harvested' && (
                        <button onClick={() => setSelectedBatch(b)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                          Review
                        </button>
                      )}
                      {b.status === 'verified' && <span className="text-green-600 text-xs font-medium">✅ Verified</span>}
                      {b.status === 'rejected' && <span className="text-red-500 text-xs font-medium">❌ Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBatch && (
        <ReviewModal
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onRefresh={fetchBatches}
        />
      )}
      {selectedQR && (
        <QRModal qrCode={selectedQR.qrCode} batchId={selectedQR.batchId} onClose={() => setSelectedQR(null)} />
      )}
    </div>
  );
}
