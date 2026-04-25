import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const user = login(res.data.token);
      if (user.role === 'farmer') navigate('/farmer/dashboard');
      else if (user.role === 'manufacturer') navigate('/manufacturer/dashboard');
      else if (user.role === 'logistics_agent') navigate('/logistics/dashboard');
      else navigate('/consumer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogin(role) {
    const user = quickLogin(role);
    navigate(role === 'farmer' ? '/farmer/dashboard' : '/consumer/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-3xl mb-1">🌿</p>
          <h1 className="text-2xl font-bold text-gray-800">Cultivar</h1>
          <p className="text-gray-400 text-sm">Agricultural Supply Chain</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">or continue as</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleQuickLogin('farmer')}
            className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 py-3 rounded-lg hover:bg-green-100 active:scale-95 transition-all font-medium text-sm">
            🌱 Farmer
          </button>
          <button onClick={() => handleQuickLogin('consumer')}
            className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 py-3 rounded-lg hover:bg-blue-100 active:scale-95 transition-all font-medium text-sm">
            🛒 Consumer
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-5 text-center">
          No account? <Link to="/register" className="text-green-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
