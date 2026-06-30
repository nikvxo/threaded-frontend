import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import OutfitsPage from './OutfitsPage.jsx';
import { AuthContext } from '../context/AuthContextInstance.js';

const mockAuth = {
  user: { email: 'test@example.com' },
  token: 'token-123',
  isAuthenticated: true,
  loading: false,
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
};

function renderPage() {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter>
        <OutfitsPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('OutfitsPage', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
  });

  it('loads and renders outfits for the signed-in user', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          title: 'Casual Friday',
          imageUrl: 'https://example.com/outfit-1.jpg',
          wornOn: '2026-06-30T12:00:00.000Z',
          items: [{ id: 10, name: 'White T-Shirt' }],
        },
      ],
    });

    renderPage();

    expect(screen.getByText('Loading your outfits...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Casual Friday' })).toBeInTheDocument();
    });

    expect(screen.getByText(/logged in as/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/white t-shirt/i)).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/outfits'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token-123',
        },
      })
    );
  });

  it('filters outfits by title or item name', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          title: 'Work Uniform',
          imageUrl: 'https://example.com/outfit-1.jpg',
          wornOn: '2026-06-29T12:00:00.000Z',
          items: [{ id: 10, name: 'Blue Button Up' }],
        },
        {
          id: 2,
          title: 'Gym Fit',
          imageUrl: 'https://example.com/outfit-2.jpg',
          wornOn: '2026-06-28T12:00:00.000Z',
          items: [{ id: 11, name: 'Running Shorts' }],
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Work Uniform' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by title or item...'), {
      target: { value: 'gym' },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Gym Fit' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: 'Work Uniform' })).toBeNull();
  });
});