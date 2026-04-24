import React from 'react';

export default function ProofViewer({ batch, onClose }) {
  if (!batch) return null;

  const mapsUrl = batch.farm_lat && batch.farm_lng
    ? `https://maps.google.com/?q=${batch.farm_lat},${batch.farm_lng}`
    : null;

  const status = batch.is_verified ? 'full'
    : (batch.farm_photo && batch.crop_photo) ? 'partial'
    : 'none';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Verification Proof — {batch.batch_id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
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

        {batch.verification_video && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Verification Video</p>
            <video src={batch.verification_video} controls className="w-full rounded border" />
          </div>
        )}

        <div className="bg-gray-50 rounded p-3 text-sm space-y-2 mb-4">
          {batch.liveness_verified && (
            <div className="flex justify-between">
              <span className="text-gray-600">🎤 Liveness Check</span>
              <span className="text-green-600 font-medium">Verified ✅</span>
            </div>
          )}
          {batch.farm_captured_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">🕐 Farm Photo Taken</span>
              <span>{new Date(batch.farm_captured_at).toLocaleString()}</span>
            </div>
          )}
          {batch.crop_captured_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">🕐 Crop Photo Taken</span>
              <span>{new Date(batch.crop_captured_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {status === 'full' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-3 mb-4">
            <span className="text-green-600">✅</span>
            <span className="text-green-700 font-medium text-sm">Fully Verified</span>
          </div>
        )}
        {status === 'partial' && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-yellow-700 font-medium text-sm">Partially Verified — No GPS data</span>
          </div>
        )}
        {status === 'none' && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-3 mb-4">
            <span className="text-red-600">❌</span>
            <span className="text-red-700 font-medium text-sm">Not Verified</span>
          </div>
        )}

        <button onClick={onClose} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700">
          Close
        </button>
      </div>
    </div>
  );
}
