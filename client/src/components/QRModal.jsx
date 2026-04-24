import React from 'react';

export default function QRModal({ qrCode, batchId, onClose }) {
  if (!qrCode) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{batchId}</h3>
        <img src={qrCode} alt={`QR code for ${batchId}`} className="mx-auto w-48 h-48" />
        <button
          onClick={onClose}
          className="mt-4 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
