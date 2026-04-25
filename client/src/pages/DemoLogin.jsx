import React from 'react';
import { useNavigate } from 'react-router-dom';
import { demoFarmer, demoConsumer } from '../demo/demoData';

export default function DemoLogin() {
  const navigate = useNavigate();

  function loginAs(user, path) {
    localStorage.setItem('demoUser', JSON.stringify(user));
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
        DEMO MODE
      </div>

      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🌿</div>
        <h1 className="text-3xl font-bold text-green-800">Cultivar</h1>
        <p className="text-green-600 mt-1 text-sm">Agricultural Supply Chain Traceability</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <p className="text-center text-gray-500 text-sm mb-2">Choose your role to explore the demo</p>

        <button
          onClick={() => loginAs(demoFarmer, '/demo/farmer')}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🌱</span>
          Login as Farmer
        </button>

        <button
          onClick={() => loginAs(demoConsumer, '/demo/consumer')}
          className="w-full bg-white text-green-700 border-2 border-green-600 py-4 rounded-2xl text-lg font-semibold hover:bg-green-50 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🛒</span>
          Login as Consumer
        </button>
      </div>

      <p className="text-gray-400 text-xs mt-10 text-center">No account needed · Offline demo · Hackathon build</p>
    </div>
  );
}
