import { useState } from 'react';
import { AuthContext } from './AuthContextInstance.js';
import { apiRequest, ApiError } from '../lib/api.js';

function getInitialAuth() {
  const raw = localStorage.getItem('threaded_auth');
  if (!raw) return { user: null, token: null };

  try {
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    };
  } catch {
    localStorage.removeItem('threaded_auth');
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth);

  function saveAuth(user, token) {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem('threaded_auth', JSON.stringify(next));
  }

  async function register({ email, password, name }) {
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { email, password, name },
      });

      saveAuth(data.user, data.token);
    } catch (error) {
      if (error instanceof ApiError) throw new Error(error.message);
      throw error;
    }
  }

  async function login({ email, password }) {
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      saveAuth(data.user, data.token);
    } catch (error) {
      if (error instanceof ApiError) throw new Error(error.message);
      throw error;
    }
  }

  function logout() {
    setAuth({ user: null, token: null });
    localStorage.removeItem('threaded_auth');
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