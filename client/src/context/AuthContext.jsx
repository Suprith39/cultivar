import React, { createContext, useContext, useState } from 'react';
import { demoFarmer, demoConsumer } from '../demo/demoData';

const AuthContext = createContext(null);

function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const demo = localStorage.getItem('demoUser');
    if (demo) return JSON.parse(demo);
    const t = localStorage.getItem('token');
    return t ? parseToken(t) : null;
  });
  const [isDemo, setIsDemo] = useState(() => !!localStorage.getItem('demoUser'));

  function login(newToken) {
    const decoded = parseToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.removeItem('demoUser');
    setToken(newToken);
    setUser(decoded);
    setIsDemo(false);
    return decoded;
  }

  function quickLogin(role) {
    const u = role === 'farmer' ? demoFarmer : demoConsumer;
    localStorage.setItem('demoUser', JSON.stringify(u));
    localStorage.removeItem('token');
    setToken(null);
    setUser(u);
    setIsDemo(true);
    return u;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('demoUser');
    setToken(null);
    setUser(null);
    setIsDemo(false);
  }

  return (
    <AuthContext.Provider value={{ token, user, isDemo, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
