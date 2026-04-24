import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import CaptureProof from './CaptureProof';

export default function HarvestEntryForm({ onSuccess }) {
  const [step, setStep] = useState('capture'); // 'capture' | 'form'
  const [proof, setProof] = useState(null);
  const [form, setForm] = useState({
    batch_id: '',
    product_name: '',
    origin: '',
    harvest_date: '',
    quantity: '',
    unit: 'kg',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/batches/next-id')
      .then(res => setForm(f => ({ ...f, batch_id: res.data.batchId })))
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleProofComplete(proofData) {
    setProof(proofData);
    setStep('form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/batches', { ...form, ...proof });
      setSuccess('Batch created successfully!');
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'capture') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">New Harvest Entry</h2>
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          📸 First, capture verification photos of your farm and crop.
        </div>
        <CaptureProof onComplete={handleProofComplete} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">New Harvest Entry</h2>
      <div className="mb-4 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700 flex items-center gap-2">
        ✅ Verification photos captured
        <button onClick={() => setStep('capture')} className="ml-auto text-xs text-green-600 underline">Retake</button>
      </div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
          <input name="batch_id" value={form.batch_id} onChange={handleChange} required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input name="product_name" value={form.product_name} onChange={handleChange} required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origin / Farm Location</label>
          <input name="origin" value={form.origin} onChange={handleChange} required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
          <input name="harvest_date" type="date" value={form.harvest_date} onChange={handleChange} required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input name="quantity" type="number" min="0" step="0.01" value={form.quantity} onChange={handleChange} required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="kg">kg</option>
            <option value="tons">tons</option>
            <option value="liters">liters</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Harvest'}
          </button>
        </div>
      </form>
    </div>
  );
}
