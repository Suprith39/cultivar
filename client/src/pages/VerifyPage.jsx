import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductJourney from '../components/ProductJourney';

export default function VerifyPage() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/verify/${batchId}`)
      .then(res => setBatch(res.data))
      .catch(err => setError(err.response?.data?.message || 'Batch not found.'))
      .finally(() => setLoading(false));
  }, [batchId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
          <span className="text-gray-400">— Product Verification</span>
        </div>
        {loading && <p className="text-gray-500">Loading product details...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {batch && <ProductJourney batch={batch} />}
      </div>
    </div>
  );
}
