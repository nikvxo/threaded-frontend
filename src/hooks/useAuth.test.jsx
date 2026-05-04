import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../context/AuthContextInstance.js';
import { useAuth } from './useAuth.js';

describe('useAuth', () => {
  it('returns the current auth context value', () => {
    const authValue = {
      user: { id: 1, name: 'Test User' },
      token: 'token-123',
      isAuthenticated: true,
      loading: false,
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(authValue);
  });

  it('throws when used outside an auth provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used inside <AuthProvider>'
    );
});
});