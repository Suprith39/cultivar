import React, { createContext, useContext, useState } from 'react';

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
    const t = localStorage.getItem('token');
    return t ? parseToken(t) : null;
  });

  function login(newToken) {
    const decoded = parseToken(newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decoded);
    return decoded;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
