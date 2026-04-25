import React, { useState } from 'react';
import { demoFarmer, demoRatings } from '../demo/demoData';

const eventConfig = {
  HARVESTED: { icon: '🌱', label: 'Harvested', color: 'border-green-500 bg-green-100' },
  IN_TRANSIT: { icon: '🚚', label: 'In Transit', color: 'border-blue-500 bg-blue-100' },
  PROCESSING: { icon: '🏭', label: 'Processing', color: 'border-orange-500 bg-orange-100' },
  PACKAGED: { icon: '📦', label: 'Packaged', color: 'border-purple-500 bg-purple-100' },
};

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  );
}

export default function DemoProductJourney({ batch, onBack }) {
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!batch) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-5 py-5 text-white">
        {onBack && (
          <button onClick={onBack} className="text-green-200 text-sm mb-2 hover:text-white">← Back</button>
        )}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-200 text-xs mb-1">Product Verification</p>
            <h2 className="text-xl font-bold">{batch.product_name}</h2>
            <p className="text-green-200 text-xs mt-1 font-mono">{batch.batch_id}</p>
          </div>
          <span className="bg-white text-green-700 px-3 py-1 rounded-full text-xs font-bold">✅ Verified</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span>🌱 {demoFarmer.name}</span>
          <span className="text-yellow-300">⭐ {demoFarmer.rating}</span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Timeline */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Product Journey</h3>
          <div className="space-y-0">
            {batch.events.map((ev, i) => {
              const cfg = eventConfig[ev.type] || { icon: '📍', label: ev.type, color: 'border-gray-400 bg-gray-100' };
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    {i < batch.events.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 my-1 min-h-4" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{cfg.label}</p>
                    <p className="text-gray-500 text-xs">{ev.location}</p>
                    <p className="text-gray-400 text-xs">{ev.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ratings */}
        <div className="border-t pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer Reviews</h3>
          <div className="space-y-3">
            {demoRatings.map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-gray-800">{r.consumer_name}</p>
                  <p className="text-xs text-gray-400">{r.created_at}</p>
                </div>
                <Stars rating={r.rating} />
                <p className="text-sm text-gray-600 mt-1">{r.review}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rating form */}
        <div className="border-t pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Rate this Product</h3>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm font-medium">
              ✅ Review submitted! Thank you.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button"
                    onClick={() => setUserRating(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    className={`text-3xl transition-colors ${i <= (hover || userRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea value={review} onChange={e => setReview(e.target.value)} rows={3}
                placeholder="Share your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              <button
                onClick={() => { if (userRating > 0) setSubmitted(true); }}
                disabled={userRating === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-40">
                Submit Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
