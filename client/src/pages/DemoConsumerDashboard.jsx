import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoBatches, demoConsumer } from '../demo/demoData';
import DemoProductJourney from '../components/DemoProductJourney';

export default function DemoConsumerDashboard() {
  const navigate = useNavigate();
  const [batchInput, setBatchInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function verify(id) {
    const batch = demoBatches.find(b => b.batch_id === id.trim().toUpperCase());
    if (batch) { setResult(batch); setError(''); }
    else { setError('No product found with this Batch ID. Try BATCH-001, BATCH-002, or BATCH-003.'); setResult(null); }
  }

  function handleSearch(e) {
    e.preventDefault();
    verify(batchInput);
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
          <p className="text-sm font-medium text-gray-800">{demoConsumer.name} 🛒</p>
          <button onClick={logout} className="text-xs text-red-500 hover:underline">Exit</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!result ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Verify a Product</h2>
            <p className="text-gray-500 text-sm mb-6">Scan a QR code or enter a Batch ID to trace the product journey.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-3xl mb-2">📷</p>
                <p className="font-semibold text-sm text-gray-800">Scan QR Code</p>
                <p className="text-gray-400 text-xs mt-1">Use your camera to scan live</p>
                <p className="text-xs text-gray-300 mt-2 italic">(Camera demo)</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-3xl mb-2">⌨️</p>
                <p className="font-semibold text-sm text-gray-800">Enter Batch ID</p>
                <p className="text-gray-400 text-xs mt-1">Type the batch ID directly</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                placeholder="Enter Batch ID (e.g. BATCH-001)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" disabled={!batchInput.trim()}
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                Verify
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-600">
              💡 Try: <strong>BATCH-001</strong>, <strong>BATCH-002</strong>, or <strong>BATCH-003</strong>
            </div>
          </>
        ) : (
          <DemoProductJourney batch={result} onBack={() => setResult(null)} />
        )}
      </div>
    </div>
  );
}
