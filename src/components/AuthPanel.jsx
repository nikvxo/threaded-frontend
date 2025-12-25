// src/components/AuthPanel.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import './AuthPanel.css';

function AuthPanel() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  }

  return (
    <main className="auth-panel">
      <h1>FitPlanner</h1>

      <div className="auth-mode-selector">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={mode === 'login' ? 'active' : ''}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={mode === 'register' ? 'active' : ''}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}

export default AuthPanel;
