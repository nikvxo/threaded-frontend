// src/context/AuthContext.jsx
import { useState } from 'react';
import { AuthContext } from './AuthContextInstance.js';
import { API_URL } from '../config.js'

function getInitialAuth() {
  const raw = localStorage.getItem('fitplanner_auth');
  if (!raw) return { user: null, token: null };

  try {
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    };
  } catch {
    localStorage.removeItem('fitplanner_auth');
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth);

  function saveAuth(user, token) {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem('fitplanner_auth', JSON.stringify(next));
  }

  async function register({ email, password, name }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    saveAuth(data.user, data.token);
  }

  async function login({ email, password }) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    saveAuth(data.user, data.token);
  }

  function logout() {
    setAuth({ user: null, token: null });
    localStorage.removeItem('fitplanner_auth');
  }

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isAuthenticated: !!auth.token,
        loading: false,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
