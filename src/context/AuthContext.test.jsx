import { render, screen} from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest'; 
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

//mocking empty localStorage 
describe('AuthProvider', () => {
    beforeEach(() => {
    localStorage.clear();
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
})