import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute role="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manufacturer/dashboard"
            element={
              <ProtectedRoute role="manufacturer">
                <ManufacturerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
