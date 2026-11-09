import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './api.js';
import { API_URL } from '../config.js';

describe('apiRequest', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('adds authentication and serializes JSON request bodies', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    await expect(
      apiRequest('/api/outfits', {
        method: 'POST',
        token: 'token-123',
        body: { title: 'Casual Friday' },
      })
    ).resolves.toEqual({ id: 1 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/outfits`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Casual Friday' }),
      })
    );
  });

  it('normalizes failed JSON responses into ApiError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Token expired' }),
    });

    await expect(apiRequest('/api/outfits', { token: 'expired-token' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Token expired',
      status: 401,
      data: { error: 'Token expired' },
    });

    expect(ApiError).toBeDefined();
  });
});