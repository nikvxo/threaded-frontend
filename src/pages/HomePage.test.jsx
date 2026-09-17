import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage.jsx';
import { AuthContext } from '../context/AuthContextInstance.js';

describe('HomePage', () => {
  it('redirects authenticated users to the outfits page', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/outfits" element={<div>Outfits Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Outfits Page')).toBeInTheDocument();
  });
});
