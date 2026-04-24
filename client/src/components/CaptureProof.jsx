import { useState } from 'react';
import exifr from 'exifr';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractExif(file) {
  try {
    const data = await exifr.parse(file, { gps: true, tiff: true });
    return {
      lat: data?.latitude || null,
      lng: data?.longitude || null,
      takenAt: data?.DateTimeOriginal || data?.DateTime || null,
    };
  } catch {
    return { lat: null, lng: null, takenAt: null };
  }
}

export default function CaptureProof({ onComplete }) {
  const [step, setStep] = useState(0);
  const [farmPhoto, setFarmPhoto] = useState(null);
  const [farmExif, setFarmExif] = useState(null);
  const [cropPhoto, setCropPhoto] = useState(null);
  const [cropExif, setCropExif] = useState(null);
  const [videoBase64, setVideoBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFarmFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const exif = await extractExif(file);
      setFarmPhoto(base64);
      setFarmExif(exif);
    } catch (err) {
      console.error('Farm photo error:', err);
    }
    setLoading(false);
  }

  async function handleCropFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const exif = await extractExif(file);
      setCropPhoto(base64);
      setCropExif(exif);
    } catch (err) {
      console.error('Crop photo error:', err);
    }
    setLoading(false);
  }

  async function handleVideoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert('Video must be under 50MB'); return; }
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      setVideoBase64(base64);
    } catch (err) {
      console.error('Video error:', err);
    }
    setLoading(false);
  }

  function handleConfirm() {
    onComplete({
      farm_photo: farmPhoto,
      crop_photo: cropPhoto,
      verification_video: videoBase64 || null,
      farm_lat: farmExif?.lat || null,
      farm_lng: farmExif?.lng || null,
      photo_taken_at: farmExif?.takenAt ? new Date(farmExif.takenAt).toISOString() : null,
    });
  }

  const verificationStatus = farmPhoto && cropPhoto
    ? (farmExif?.lat && cropExif?.lat ? 'full' : 'partial')
    : 'none';

  // Step 1 — Farm photo
  if (step === 0) return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 1 — Upload a photo of your farm</h3>
      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors">
        <input type="file" accept="image/*" className="hidden" onChange={handleFarmFile} />
        {loading ? <p className="text-gray-500">Processing...</p>
          : farmPhoto ? <p className="text-green-600 text-sm">✅ Photo selected — click to change</p>
          : <div><p className="text-gray-500 text-sm">Click to upload farm photo</p><p className="text-gray-400 text-xs mt-1">JPG, PNG supported</p></div>
        }
      </label>
      {farmPhoto && (
        <div className="space-y-3">
          <img src={farmPhoto} alt="farm preview" className="w-full rounded-lg max-h-48 object-cover" />
          {farmExif?.lat ? (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm space-y-1">
              <p className="text-green-700 font-medium">✅ Location data found</p>
              <p className="text-gray-600">📍 {farmExif.lat.toFixed(5)}, {farmExif.lng.toFixed(5)}</p>
              {farmExif.takenAt && <p className="text-gray-600">🕐 {new Date(farmExif.takenAt).toLocaleString()}</p>}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="text-yellow-700 font-medium">⚠️ No location data in this photo</p>
              <p className="text-yellow-600 text-xs mt-1">Verification will be limited</p>
            </div>
          )}
          <button
            onClick={() => setStep(1)}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  // Step 2 — Crop photo
  if (step === 1) return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 2 — Upload a photo of your crop</h3>
      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors">
        <input type="file" accept="image/*" className="hidden" onChange={handleCropFile} />
        {loading ? <p className="text-gray-500">Processing...</p>
          : cropPhoto ? <p className="text-green-600 text-sm">✅ Photo selected — click to change</p>
          : <div><p className="text-gray-500 text-sm">Click to upload crop photo</p><p className="text-gray-400 text-xs mt-1">JPG, PNG supported</p></div>
        }
      </label>
      {cropPhoto && (
        <div className="space-y-3">
          <img src={cropPhoto} alt="crop preview" className="w-full rounded-lg max-h-48 object-cover" />
          {cropExif?.lat ? (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm space-y-1">
              <p className="text-green-700 font-medium">✅ Location data found</p>
              <p className="text-gray-600">📍 {cropExif.lat.toFixed(5)}, {cropExif.lng.toFixed(5)}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="text-yellow-700 font-medium">⚠️ No location data in this photo</p>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">
          ← Back
        </button>
        <button
          onClick={() => setStep(2)}
          disabled={!cropPhoto}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );

  // Step 3 — Video (optional)
  if (step === 2) return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 3 — Upload Verification Video (Optional)</h3>
      <p className="text-xs text-gray-500">Max size: 50MB</p>
      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors">
        <input type="file" accept="video/*" className="hidden" onChange={handleVideoFile} />
        {loading ? <p className="text-gray-500">Processing video...</p>
          : videoBase64 ? <p className="text-green-600 text-sm">✅ Video selected — click to change</p>
          : <div><p className="text-gray-500 text-sm">Click to upload video</p><p className="text-gray-400 text-xs mt-1">MP4, WebM • Max 50MB</p></div>
        }
      </label>
      <div className="flex gap-2">
        <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">← Back</button>
        <button onClick={() => setStep(3)} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm">
          {videoBase64 ? 'Next →' : 'Skip →'}
        </button>
      </div>
    </div>
  );

  // Step 4 — Summary
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 4 — Verification Summary</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Farm Photo</p>
          <img src={farmPhoto} alt="farm" className="w-full rounded border max-h-32 object-cover" />
          {farmExif?.lat && <p className="text-xs text-gray-500 mt-1">📍 {farmExif.lat.toFixed(4)}, {farmExif.lng.toFixed(4)}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Crop Photo</p>
          <img src={cropPhoto} alt="crop" className="w-full rounded border max-h-32 object-cover" />
          {cropExif?.lat && <p className="text-xs text-gray-500 mt-1">📍 {cropExif.lat.toFixed(4)}, {cropExif.lng.toFixed(4)}</p>}
        </div>
      </div>
      <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
        <p>🎥 Video: {videoBase64 ? 'Uploaded' : 'Skipped'}</p>
        {farmExif?.takenAt && <p>🕐 {new Date(farmExif.takenAt).toLocaleString()}</p>}
      </div>
      {verificationStatus === 'full' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-3">
          <span>✅</span><span className="text-green-700 font-medium text-sm">Fully Verified — GPS found in both photos</span>
        </div>
      )}
      {verificationStatus === 'partial' && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded p-3">
          <span>⚠️</span><span className="text-yellow-700 font-medium text-sm">Partially Verified — No GPS data in photos</span>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">← Back</button>
        <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium text-sm">
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
