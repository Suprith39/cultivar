import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ManufacturerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">Agri Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-lg shadow p-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">Manufacturer Dashboard</h2>
          <p className="text-gray-500 text-lg">Stage 2: Processing module coming soon</p>
        </div>
      </div>
    </div>
  );
}
