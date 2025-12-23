// src/components/AuthPanel.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

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
    <main className="card">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>FitPlanner</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          style={{ marginRight: '0.5rem' }}
        >
          Login
        </button>
        <button type="button" onClick={() => setMode('register')}>
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}

export default AuthPanel;
