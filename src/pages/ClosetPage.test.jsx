import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import ClosetPage from './ClosetPage.jsx';
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
        <ClosetPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ClosetPage', () => {
  const originalFetch = globalThis.fetch;
  const originalConfirm = globalThis.confirm;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    globalThis.confirm = vi.fn();
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
    globalThis.confirm = originalConfirm;
  });

  it('loads closet items and shows usage counts', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, name: 'White T-Shirt' },
          { id: 11, name: 'Blue Jeans' },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            title: 'Casual Friday',
            wornOn: '2026-06-30T12:00:00.000Z',
            items: [{ id: 10, name: 'White T-Shirt' }],
          },
          {
            id: 2,
            title: 'Weekend Fit',
            wornOn: '2026-06-29T12:00:00.000Z',
            items: [{ id: 10, name: 'White T-Shirt' }, { id: 11, name: 'Blue Jeans' }],
          },
        ],
      });

    renderPage();

    expect(screen.getByText('Loading your closet...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '2 Clothing Items' })).toBeInTheDocument();
    });

    expect(screen.getByText('White T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('2 outfits')).toBeInTheDocument();
    expect(screen.getByText('Blue Jeans')).toBeInTheDocument();
    expect(screen.getByText('1 outfit')).toBeInTheDocument();
    expect(screen.getByText(/logged in as/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('opens the item detail view when a closet item is clicked', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 10, name: 'White T-Shirt' }],
      })
      .mockResolvedValueOnce({
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
      })
      .mockResolvedValueOnce({
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

    await waitFor(() => {
      expect(screen.getByText('White T-Shirt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('White T-Shirt'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /outfits with "white t-shirt"/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Casual Friday' })).toBeInTheDocument();
    expect(screen.getByText('1 outfit found')).toBeInTheDocument();
  });

  it('shows the empty state when the closet has no items', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Your closet is empty!' })).toBeInTheDocument();
    });

    expect(screen.getByText('Add outfits to automatically build your virtual closet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Your First Outfit' })).toBeInTheDocument();
  });
});