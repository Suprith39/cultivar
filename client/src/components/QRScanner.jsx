import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose, onError }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanner.stop().then(() => {
          onScan(decodedText);
        }).catch(() => {});
      },
      () => {}
    ).then(() => {
      setScanning(true);
    }).catch(() => {
      setError('Camera access denied. Please upload a QR image or enter the Batch ID manually.');
      if (onError) onError('Camera access denied. Please upload a QR image or enter the Batch ID manually.');
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
        <div className="bg-green-600 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white font-semibold">Scan QR Code</h3>
          <button onClick={onClose} className="text-white hover:text-green-200 text-xl leading-none">✕</button>
        </div>
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={onClose} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Close</button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full rounded overflow-hidden" />
              {scanning && <p className="text-center text-gray-500 text-sm mt-3 animate-pulse">Scanning...</p>}
              <button onClick={onClose} className="mt-3 w-full border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
