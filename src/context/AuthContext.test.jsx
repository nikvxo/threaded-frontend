import { render, renderHook, screen, cleanup, waitFor} from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'; 
import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js'; 
import { API_URL } from '../config.js';


// create a component that uses useAuth to expose auth values as text in DOM 
function AuthConsumer() {
    const { user, token, isAuthenticated } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
            <div data-testid="token">{token || 'null'}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
        </div>
    );
}

//mocking empty localStorage for testing 
describe('AuthProvider', () => {
    beforeEach(() => {
    localStorage.clear();
});
    afterEach(() => {
        cleanup();
    });
//test that state is Logged out when localStorage is empty 
    it('initializes with logged out when storage empty', () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null'); 
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false'); 
        });

    it('initializes with information from localStorage, non null values', () => {
        const storedAuth = {
            user: { id: 1, email: 'test@example.com' },
            token: 'token-abc-123', 
        }; 

        localStorage.setItem('threaded_auth', JSON.stringify(storedAuth));

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com'); 
        expect(screen.getByTestId('token')).toHaveTextContent('token-abc-123');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        });
    
    it('initalizes with null values if localStorage auth is invalid', () => {
        localStorage.setItem('threaded_auth', '{this is invalid json {{{');
        
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

        expect(localStorage.getItem('threaded_auth')).toBeNull();
    })
});

describe('AuthProvider logout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('clears auth state and storage when logout is called', async () => {
    // Component that exposes logout button
    function LogoutConsumer() {
      const { user, token, isAuthenticated, logout } = useAuth();
      return (
        <div>
          <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
          <div data-testid="token">{token || 'null'}</div>
          <div data-testid="authenticated">{isAuthenticated.toString()}</div>
          <button onClick={logout} data-testid="logout-btn">Logout</button>
        </div>
      );
    }

    // Start with logged-in state
    const storedAuth = {
      user: { id: 1, email: 'test@example.com' },
      token: 'token-abc-123',
    };
    localStorage.setItem('threaded_auth', JSON.stringify(storedAuth));

    render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>
    );

    // Assert user is logged in
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(localStorage.getItem('threaded_auth')).not.toBeNull();

    // Call logout
    screen.getByTestId('logout-btn').click();

    // Assert state is cleared
    await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(localStorage.getItem('threaded_auth')).toBeNull();
    });
  });
});

const originalFetch = globalThis.fetch;

function renderAuthHook() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
}

describe('AuthProvider login', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
  });

  it('stores auth and updates context when login succeeds', async () => {
    const user = { id: 1, email: 'test@example.com' };
    const token = 'token-abc-123';

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user, token }),
    });

    const { result } = renderAuthHook();

    await result.current.login({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
      expect(result.current.token).toBe(token);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/auth/login`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    );

    expect(localStorage.getItem('threaded_auth')).toBe(
      JSON.stringify({ user, token })
    );
  });

  it('throws and does not store auth when login fails', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    const { result } = renderAuthHook();

    await expect(
      result.current.login({
        email: 'test@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('threaded_auth')).toBeNull();
  });
});