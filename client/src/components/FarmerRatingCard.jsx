import React from 'react';

function Stars({ rating, size = 'text-lg' }) {
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  );
}

export default function FarmerRatingCard({ data }) {
  if (!data) return null;
  const { average, total, distribution, reviews } = data;

  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-800">{average.toFixed(1)}</p>
          <Stars rating={average} />
          <p className="text-xs text-gray-500 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-gray-500">{star}★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-gray-400">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          {reviews.map(r => (
            <div key={r.id} className="space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-gray-800">{r.consumer_name}</p>
                  <Stars rating={r.rating} size="text-sm" />
                </div>
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-gray-600">{r.review}</p>
              {r.review_photo && (
                <img src={r.review_photo} alt="review" className="w-24 h-24 object-cover rounded border" />
              )}
              <p className="text-xs text-gray-400">Batch: {r.batch_id}</p>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-2">No reviews yet.</p>
      )}
    </div>
  );
}
