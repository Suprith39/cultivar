import { useState, useEffect } from 'react';

export default function LocationCapture({ onChange }) {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [status, setStatus] = useState('detecting'); // detecting | found | denied

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const l = pos.coords.latitude;
        const g = pos.coords.longitude;
        setLat(l);
        setLng(g);
        setStatus('found');
        onChange({ lat: l, lng: g, placeName: `${l.toFixed(4)}, ${g.toFixed(4)}` });
      },
      () => setStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  function handlePlaceChange(e) {
    setPlaceName(e.target.value);
    onChange({ lat: null, lng: null, placeName: e.target.value });
  }

  if (status === 'detecting') return (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      Detecting location...
    </div>
  );

  if (status === 'found') return (
    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
      <p className="text-green-700 font-medium">📍 Location detected ✅</p>
      <p className="text-gray-600 mt-1">{lat?.toFixed(5)}, {lng?.toFixed(5)}</p>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
        <p className="text-yellow-700">⚠️ Location access denied. Enter location manually.</p>
      </div>
      <input
        value={placeName}
        onChange={handlePlaceChange}
        placeholder="Enter city or location name"
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
