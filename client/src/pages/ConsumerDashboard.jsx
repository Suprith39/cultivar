import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import ProductJourney from '../components/ProductJourney';
import QRScanner from '../components/QRScanner';

export default function ConsumerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [batchInput, setBatchInput] = useState('');
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  async function fetchBatch(batchId) {
    setError('');
    setBatch(null);
    setLoading(true);
    try {
      const res = await axios.get(`/api/verify/${batchId.trim()}`);
      setBatch(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No product found with this Batch ID.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (batchInput.trim()) fetchBatch(batchInput);
  }

  function handleScan(decodedText) {
    setShowScanner(false);
    setBatchInput(decodedText);
    fetchBatch(decodedText);
  }

  async function handleQRFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setBatch(null);
    setLoading(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-reader');
      const result = await html5QrCode.scanFile(file, false);
      await html5QrCode.clear();
      setBatchInput(result);
      fetchBatch(result);
    } catch {
      setLoading(false);
      setError('No QR code detected in this image. Please try again or enter the Batch ID manually.');
    }

    // Reset file input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify a Product</h2>
        <p className="text-gray-500 text-sm mb-6">Choose how you'd like to verify this product.</p>

        {/* Three option cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Option 1 — Camera Scan */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:border-green-400 hover:shadow-sm transition-all text-center"
          >
            <span className="text-3xl">📷</span>
            <p className="font-semibold text-gray-800 text-sm">Scan QR Code</p>
            <p className="text-gray-400 text-xs">Use your camera to scan live</p>
          </button>

          {/* Option 2 — Upload QR Image */}
          <label className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:border-green-400 hover:shadow-sm transition-all text-center cursor-pointer">
            <span className="text-3xl">🖼️</span>
            <p className="font-semibold text-gray-800 text-sm">Upload QR Image</p>
            <p className="text-gray-400 text-xs">Upload a photo of the QR code</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQRFileUpload}
            />
          </label>

          {/* Option 3 — Manual Entry (scroll down indicator) */}
          <div className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-3xl">⌨️</span>
            <p className="font-semibold text-gray-800 text-sm">Enter Batch ID</p>
            <p className="text-gray-400 text-xs">Type the batch ID directly</p>
          </div>
        </div>

        {/* Hidden div required by html5-qrcode for file scanning */}
        <div id="qr-file-reader" className="hidden" />

        {/* Manual entry form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={batchInput}
            onChange={e => setBatchInput(e.target.value)}
            placeholder="Enter Batch ID (e.g. BATCH-001)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading || !batchInput.trim()}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? '...' : 'Verify'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {batch && <ProductJourney batch={batch} />}
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          onError={(msg) => { setShowScanner(false); setError(msg); }}
        />
      )}
    </div>
  );
}
