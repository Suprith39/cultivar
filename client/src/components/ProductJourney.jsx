import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const statusColors = {
  harvested: 'bg-green-100 text-green-700 border-green-300',
  processing: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  packaged: 'bg-blue-100 text-blue-700 border-blue-300',
};

function StarSelector({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={`text-3xl transition-colors ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingSection({ batch }) {
  const { user, token } = useAuth();
  const [ratingData, setRatingData] = useState(null);
  const [existing, setExisting] = useState(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch farmer ratings
    if (batch?.farmer_id) {
      axios.get(`/api/ratings/farmer/${batch.farmer_id}`)
        .then(r => setRatingData(r.data))
        .catch(() => {});
    }
    // Check if consumer already rated
    if (token && user?.role === 'consumer' && batch?.batch_id) {
      api.get(`/ratings/check/${batch.batch_id}`)
        .then(r => { setAlreadyRated(r.data.rated); setExisting(r.data.existing); })
        .catch(() => {});
    }
  }, [batch, token, user]);

  async function handlePhotoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReviewPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (review.trim().length < 10) { setError('Review must be at least 10 characters.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/ratings/submit', {
        farmerId: batch.farmer_id,
        batchId: batch.batch_id,
        rating,
        review,
        reviewPhoto,
      });
      setSuccess('✅ Review submitted successfully!');
      setAlreadyRated(true);
      setExisting({ rating, review, review_photo: reviewPhoto });
      // refresh ratings
      const r = await axios.get(`/api/ratings/farmer/${batch.farmer_id}`);
      setRatingData(r.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Product Ratings</h3>

      {/* Overall rating summary */}
      {ratingData && ratingData.total > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-lg">{'★'.repeat(Math.round(ratingData.average))}</span>
          <span className="font-semibold text-gray-800">{ratingData.average.toFixed(1)}</span>
          <span className="text-gray-400 text-sm">({ratingData.total} review{ratingData.total !== 1 ? 's' : ''})</span>
        </div>
      )}

      {/* Consumer rating form or existing review */}
      {user?.role === 'consumer' && (
        <div className="bg-gray-50 rounded-xl p-4">
          {alreadyRated && existing ? (
            <div className="space-y-2">
              <p className="text-green-600 text-sm font-medium">✅ You have already reviewed this batch</p>
              <div className="text-yellow-400">{'★'.repeat(existing.rating)}{'☆'.repeat(5 - existing.rating)}</div>
              <p className="text-sm text-gray-700">{existing.review}</p>
              {existing.review_photo && <img src={existing.review_photo} alt="your review" className="w-24 h-24 object-cover rounded border" />}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Rate this Product</p>
                <p className="text-xs text-gray-500 mb-3">{batch.product_name} · {batch.origin}</p>
                <StarSelector value={rating} onChange={setRating} />
              </div>
              <div>
                <textarea
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <p className="text-xs text-gray-400 text-right">{review.length}/500</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Add a photo (optional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoFile} className="text-sm" />
                {reviewPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={reviewPhoto} alt="preview" className="w-16 h-16 object-cover rounded border" />
                    <button type="button" onClick={() => setReviewPhoto(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <button type="submit" disabled={submitting}
                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* All reviews */}
      {ratingData?.reviews?.length > 0 && (
        <div className="mt-4 space-y-3">
          {ratingData.reviews.map(r => (
            <div key={r.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-gray-800">{r.consumer_name}</p>
                  <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">{r.review}</p>
              {r.review_photo && <img src={r.review_photo} alt="review" className="w-20 h-20 object-cover rounded border mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductJourney({ batch }) {
  if (!batch) return null;

  const mapsUrl = batch.farm_lat && batch.farm_lng
    ? `https://maps.google.com/?q=${batch.farm_lat},${batch.farm_lng}`
    : null;

  const verificationStatus = batch.is_verified ? 'full'
    : (batch.farm_photo && batch.crop_photo) ? 'partial'
    : 'none';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-200 text-sm mb-1">Product Verification</p>
            <h2 className="text-2xl font-bold">{batch.product_name}</h2>
            <p className="text-green-200 text-sm mt-1 font-mono">{batch.batch_id}</p>
          </div>
          <div className="text-right">
            {verificationStatus === 'full' && (
              <span className="bg-white text-green-700 px-3 py-1 rounded-full text-sm font-semibold">✅ Verified</span>
            )}
            {verificationStatus === 'partial' && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">⚠️ Partially Verified</span>
            )}
            {verificationStatus === 'none' && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">❌ Unverified</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Journey Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Product Journey</h3>
          <div className="space-y-0">

            {/* Step 1 — Farm */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-lg">🌱</div>
                <div className="w-0.5 bg-gray-200 flex-1 my-1" />
              </div>
              <div className="pb-6 flex-1">
                <p className="font-semibold text-gray-800">Farm — Harvested</p>
                <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <p><span className="text-gray-500">Farmer:</span> {batch.farmer_name}</p>
                  <p><span className="text-gray-500">Origin:</span> {batch.origin}</p>
                  <p><span className="text-gray-500">Harvest Date:</span> {new Date(batch.harvest_date).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">Quantity:</span> {batch.quantity} {batch.unit}</p>
                  {mapsUrl && (
                    <p>
                      <span className="text-gray-500">📍 GPS: </span>
                      <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
                        {parseFloat(batch.farm_lat).toFixed(4)}, {parseFloat(batch.farm_lng).toFixed(4)} ↗
                      </a>
                    </p>
                  )}
                  {batch.photo_taken_at && (
                    <p><span className="text-gray-500">🕐 Photo taken:</span> {new Date(batch.photo_taken_at).toLocaleString()}</p>
                  )}
                </div>
                {batch.farm_photo && (
                  <img src={batch.farm_photo} alt="farm" className="mt-2 w-full max-h-32 object-cover rounded-lg border" />
                )}
              </div>
            </div>

            {/* Step 2 — In Transit (logistics events) */}
            {batch.events && batch.events.length > 0 && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-lg">🚚</div>
                  <div className="w-0.5 bg-gray-200 flex-1 my-1" />
                </div>
                <div className="pb-6 flex-1">
                  <p className="font-semibold text-gray-800">In Transit</p>
                  <div className="mt-2 space-y-2">
                    {batch.events.map((ev, i) => {
                      const evMaps = ev.lat && ev.lng ? `https://maps.google.com/?q=${ev.lat},${ev.lng}` : null;
                      return (
                        <div key={i} className="bg-blue-50 rounded p-2 text-xs space-y-1">
                          <p>📍 {ev.place_name || `${ev.lat}, ${ev.lng}`}</p>
                          <p>🕐 {new Date(ev.timestamp).toLocaleString()}</p>
                          {evMaps && <a href={evMaps} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View on Maps ↗</a>}
                          {ev.agent_name && <p className="text-gray-500">Agent: {ev.agent_name}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Processing */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg ${batch.status !== 'harvested' ? 'bg-yellow-100 border-yellow-500' : 'bg-gray-100 border-gray-300'}`}>
                  🏭
                </div>
                <div className="w-0.5 bg-gray-200 flex-1 my-1" />
              </div>
              <div className="pb-6 flex-1">
                <p className={`font-semibold ${batch.status !== 'harvested' ? 'text-gray-800' : 'text-gray-400'}`}>
                  Manufacturer — Processing
                </p>
                {batch.status !== 'harvested' ? (
                  <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm">
                    <p><span className="text-gray-500">Status updated to:</span> <span className="capitalize font-medium">{batch.status}</span></p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">Pending manufacturer processing</p>
                )}
              </div>
            </div>

            {/* Step 3 — Current Status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-lg">📦</div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Current Status</p>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border capitalize ${statusColors[batch.status] || 'bg-gray-100 text-gray-700'}`}>
                    {batch.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Section */}
        {(batch.farm_photo || batch.crop_photo) && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Verification Proof</h3>
            <div className="grid grid-cols-2 gap-3">
              {batch.farm_photo && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Farm Photo</p>
                  <img src={batch.farm_photo} alt="farm" className="w-full rounded border max-h-32 object-cover" />
                </div>
              )}
              {batch.crop_photo && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Crop Photo</p>
                  <img src={batch.crop_photo} alt="crop" className="w-full rounded border max-h-32 object-cover" />
                </div>
              )}
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded p-3 text-sm ${
              verificationStatus === 'full' ? 'bg-green-50 border border-green-200' :
              verificationStatus === 'partial' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <span>{verificationStatus === 'full' ? '✅' : verificationStatus === 'partial' ? '⚠️' : '❌'}</span>
              <span className={`font-medium ${
                verificationStatus === 'full' ? 'text-green-700' :
                verificationStatus === 'partial' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {verificationStatus === 'full' ? 'Fully Verified — GPS data confirmed' :
                 verificationStatus === 'partial' ? 'Partially Verified — Photos uploaded, no GPS' :
                 'Not Verified'}
              </span>
            </div>
          </div>
        )}

        {/* Rating Section */}
        <RatingSection batch={batch} />
      </div>
    </div>
  );
}
