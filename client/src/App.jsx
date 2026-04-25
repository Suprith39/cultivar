import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import VerifyPage from './pages/VerifyPage';
import LogisticsDashboard from './pages/LogisticsDashboard';
import DemoLogin from './pages/DemoLogin';
import DemoFarmerDashboard from './pages/DemoFarmerDashboard';
import DemoConsumerDashboard from './pages/DemoConsumerDashboard';

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.classList.add('notranslate');
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:batchId" element={<VerifyPage />} />
          <Route path="/demo" element={<DemoLogin />} />
          <Route path="/demo/farmer" element={<DemoFarmerDashboard />} />
          <Route path="/demo/consumer" element={<DemoConsumerDashboard />} />
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
          <Route
            path="/consumer/dashboard"
            element={
              <ProtectedRoute role="consumer">
                <ConsumerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logistics/dashboard"
            element={
              <ProtectedRoute role="logistics_agent">
                <LogisticsDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
