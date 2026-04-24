import { useState, useRef, useEffect, useCallback } from 'react';

const EAR_THRESHOLD = 0.2;
const REQUIRED_BLINKS = 2;
const COUNTDOWN_SECONDS = 30;
const LEFT_EYE = { top: 159, bottom: 145, left: 33, right: 133 };
const RIGHT_EYE = { top: 386, bottom: 374, left: 362, right: 263 };

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function calcEAR(kp, eye) {
  const v = dist(kp[eye.top], kp[eye.bottom]);
  const h = dist(kp[eye.left], kp[eye.right]);
  return h > 0 ? v / h : 1;
}

function BlinkCapture({ label, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [blinkCount, setBlinkCount] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);
  const [verified, setVerified] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const blinkStateRef = useRef(false);
  const blinkCountRef = useRef(0);
  const verifiedRef = useRef(false);
  const canvas = useRef(document.createElement('canvas'));

  // Attach stream to video element whenever stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const runDetection = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || verifiedRef.current) return;
    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current);
      if (faces.length > 0) {
        const kp = faces[0].keypoints;
        const ear = (calcEAR(kp, LEFT_EYE) + calcEAR(kp, RIGHT_EYE)) / 2;
        if (ear < EAR_THRESHOLD && !blinkStateRef.current) {
          blinkStateRef.current = true;
        } else if (ear >= EAR_THRESHOLD && blinkStateRef.current) {
          blinkStateRef.current = false;
          blinkCountRef.current += 1;
          setBlinkCount(blinkCountRef.current);
          if (blinkCountRef.current >= REQUIRED_BLINKS) {
            verifiedRef.current = true;
            cancelAnimationFrame(rafRef.current);
            clearInterval(timerRef.current);
            setVerified(true);
            setPhase('verified');
            return;
          }
        }
      }
    } catch {}
    rafRef.current = requestAnimationFrame(runDetection);
  }, []);

  function startCountdown() {
    clearInterval(timerRef.current);
    let t = COUNTDOWN_SECONDS;
    setCountdown(t);
    timerRef.current = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0 && !verifiedRef.current) {
        clearInterval(timerRef.current);
        cancelAnimationFrame(rafRef.current);
        blinkCountRef.current = 0;
        blinkStateRef.current = false;
        setBlinkCount(0);
        setFeedback('❌ Blink not detected. Try again.');
        startCountdown();
        rafRef.current = requestAnimationFrame(runDetection);
      }
    }, 1000);
  }

  async function handleStart() {
    setError('');
    setFeedback('');
    blinkCountRef.current = 0;
    blinkStateRef.current = false;
    verifiedRef.current = false;
    setBlinkCount(0);
    setVerified(false);

    let newStream;
    try {
      newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(newStream);
      setPhase('loading');
    } catch {
      setError('Please allow camera access to continue. This is required to verify your presence.');
      return;
    }

    try {
      const fld = await import('@tensorflow-models/face-landmarks-detection');
      await import('@tensorflow/tfjs-backend-webgl');
      const model = fld.SupportedModels.MediaPipeFaceMesh;
      const detector = await fld.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: false,
      });
      detectorRef.current = detector;
    } catch {
      setError('Face detector failed to load. Please refresh and try again.');
      newStream.getTracks().forEach(t => t.stop());
      setStream(null);
      setPhase('idle');
      return;
    }

    setPhase('detecting');
    startCountdown();
    rafRef.current = requestAnimationFrame(runDetection);
  }

  function capturePhoto() {
    const v = videoRef.current;
    canvas.current.width = v.videoWidth || 640;
    canvas.current.height = v.videoHeight || 480;
    canvas.current.getContext('2d').drawImage(v, 0, 0);
    setPhoto(canvas.current.toDataURL('image/jpeg', 0.85));
    setCapturedAt(new Date().toISOString());
    setPhase('preview');
  }

  function retake() {
    setPhoto(null);
    setPhase('verified');
  }

  function confirmPhoto() {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    onComplete({ photo, capturedAt });
  }

  const cameraActive = phase === 'loading' || phase === 'detecting' || phase === 'verified';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{label}</h3>

      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">{error}</div>}

      {/* Idle instruction */}
      {phase === 'idle' && (
        <div className="text-center space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-4xl mb-3">👁️</p>
            <p className="font-semibold text-gray-800 text-lg mb-1">Blink Detection</p>
            <p className="text-gray-500 text-sm">Look at the camera and blink <strong>2 times</strong> to verify you are present</p>
          </div>
          <button onClick={handleStart} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
            Start Verification
          </button>
        </div>
      )}

      {/* Video element — always in DOM when camera active so ref is stable */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className={`w-full rounded-lg object-cover aspect-video ${cameraActive ? (verified ? 'ring-4 ring-green-500' : '') : 'hidden'}`}
      />

      {phase === 'loading' && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          Loading face detector...
        </div>
      )}

      {phase === 'detecting' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-gray-50 rounded p-3">
            <span className="text-sm text-gray-700">Blinks: <strong>{blinkCount} / {REQUIRED_BLINKS}</strong></span>
            <span className={`font-bold text-lg ${countdown <= 5 ? 'text-red-500' : 'text-gray-700'}`}>{countdown}s</span>
          </div>
          {feedback && <p className="text-sm text-orange-600">{feedback}</p>}
          <p className="text-xs text-gray-400 text-center">Look directly at the camera and blink naturally</p>
        </div>
      )}

      {phase === 'verified' && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700 font-medium">
            ✅ Liveness verified! Now point your camera at the {label.includes('Farm') ? 'farm' : 'crop'}.
          </div>
          <button onClick={capturePhoto} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            📸 Capture Photo
          </button>
        </div>
      )}

      {phase === 'preview' && photo && (
        <div className="space-y-3">
          <img src={photo} alt="captured" className="w-full rounded-lg" />
          <p className="text-xs text-gray-500">🕐 {new Date(capturedAt).toLocaleString()}</p>
          <div className="flex gap-2">
            <button onClick={retake} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">Retake</button>
            <button onClick={confirmPhoto} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium">
              ✅ Use this photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaptureProof({ onComplete }) {
  const [step, setStep] = useState(0);
  const [farmPhoto, setFarmPhoto] = useState(null);
  const [farmCapturedAt, setFarmCapturedAt] = useState(null);
  const [cropPhoto, setCropPhoto] = useState(null);
  const [cropCapturedAt, setCropCapturedAt] = useState(null);
  const [videoBase64, setVideoBase64] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  function handleFarmComplete({ photo, capturedAt }) {
    setFarmPhoto(photo);
    setFarmCapturedAt(capturedAt);
    setStep(1);
  }

  function handleCropComplete({ photo, capturedAt }) {
    setCropPhoto(photo);
    setCropCapturedAt(capturedAt);
    setStep(2);
  }

  async function handleVideoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert('Video must be under 50MB'); return; }
    setVideoLoading(true);
    const reader = new FileReader();
    reader.onload = () => { setVideoBase64(reader.result); setVideoLoading(false); };
    reader.readAsDataURL(file);
  }

  function handleConfirm() {
    onComplete({
      farm_photo: farmPhoto,
      crop_photo: cropPhoto,
      verification_video: videoBase64 || null,
      farm_captured_at: farmCapturedAt,
      crop_captured_at: cropCapturedAt,
      liveness_verified: true,
    });
  }

  if (step === 0) return <BlinkCapture label="Step 1 — Farm Photo (Blink Verification)" onComplete={handleFarmComplete} />;
  if (step === 1) return <BlinkCapture label="Step 2 — Crop Photo (Blink Verification)" onComplete={handleCropComplete} />;

  if (step === 2) return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 3 — Verification Video (Optional)</h3>
      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400">
        <input type="file" accept="video/*" className="hidden" onChange={handleVideoFile} />
        {videoLoading ? <p className="text-gray-500">Processing...</p>
          : videoBase64 ? <p className="text-green-600 text-sm">✅ Video selected</p>
          : <div><p className="text-gray-500 text-sm">Click to upload video</p><p className="text-gray-400 text-xs mt-1">MP4, WebM • Max 50MB</p></div>}
      </label>
      <div className="flex gap-2">
        <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">← Back</button>
        <button onClick={() => setStep(3)} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm">
          {videoBase64 ? 'Next →' : 'Skip →'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 4 — Verification Summary</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Farm Photo</p>
          <img src={farmPhoto} alt="farm" className="w-full rounded border max-h-32 object-cover" />
          <p className="text-xs text-green-600 mt-1">👁️ Blink Verified ✅</p>
          {farmCapturedAt && <p className="text-xs text-gray-400">🕐 {new Date(farmCapturedAt).toLocaleString()}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Crop Photo</p>
          <img src={cropPhoto} alt="crop" className="w-full rounded border max-h-32 object-cover" />
          <p className="text-xs text-green-600 mt-1">👁️ Blink Verified ✅</p>
          {cropCapturedAt && <p className="text-xs text-gray-400">🕐 {new Date(cropCapturedAt).toLocaleString()}</p>}
        </div>
      </div>
      <div className="bg-gray-50 rounded p-3 text-sm">
        <p>🎥 Video: {videoBase64 ? 'Uploaded' : 'Skipped'}</p>
      </div>
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-3">
        <span>✅</span>
        <span className="text-green-700 font-medium text-sm">Fully Verified — Live presence confirmed</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">← Back</button>
        <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium text-sm">
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
