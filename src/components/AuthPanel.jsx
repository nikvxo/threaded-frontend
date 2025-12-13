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
    <main style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem' }}>
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
            style={{
              padding: '0.5rem',
              width: '100%',
              marginBottom: '0.5rem',
            }}
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{
            padding: '0.5rem',
            width: '100%',
            marginBottom: '0.5rem',
          }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{
            padding: '0.5rem',
            width: '100%',
            marginBottom: '0.5rem',
          }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}

export default AuthPanel;
