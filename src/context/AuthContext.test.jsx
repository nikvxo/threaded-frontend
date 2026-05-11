import { render, screen, cleanup, waitFor} from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest'; 
import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js'; 


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