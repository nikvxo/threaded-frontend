// src/pages/HomePage.jsx
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function HomePage() {
  const { isAuthenticated } = useAuth();

  // Redirect to outfits if already logged in
  if (isAuthenticated) {
    return <Navigate to="/outfits" replace />;
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '3rem',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '3.5rem', 
        marginBottom: '1rem',
        color: '#4a3c31',
        fontWeight: 700
      }}>
        Welcome to Threaded
      </h1>
      <p style={{ 
        fontSize: '1.3rem', 
        marginBottom: '2.5rem', 
        color: '#5f564d',
        lineHeight: '1.6'
      }}>
        Your digital wardrobe assistant. Track your outfits, tag clothing items, and never forget what you wore.
      </p>
      <div style={{ marginBottom: '3rem' }}>
        <Link 
          to="/login" 
          style={{ 
            display: 'inline-block',
            padding: '1rem 3rem',
            backgroundColor: '#d97706',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b45309';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#d97706';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          Get Started
        </Link>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '3rem',
        textAlign: 'left'
      }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#eaddc7', borderRadius: '8px' }}>
          <h3 style={{ color: '#4a3c31', marginBottom: '0.5rem' }}>📸 Upload Photos</h3>
          <p style={{ color: '#5f564d', fontSize: '0.95rem', margin: 0 }}>
            Capture and save your daily outfits
          </p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#eaddc7', borderRadius: '8px' }}>
          <h3 style={{ color: '#4a3c31', marginBottom: '0.5rem' }}>🏷️ Tag Items</h3>
          <p style={{ color: '#5f564d', fontSize: '0.95rem', margin: 0 }}>
            Organize by clothing items and accessories
          </p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#eaddc7', borderRadius: '8px' }}>
          <h3 style={{ color: '#4a3c31', marginBottom: '0.5rem' }}>🔍 Search</h3>
          <p style={{ color: '#5f564d', fontSize: '0.95rem', margin: 0 }}>
            Find outfits by date, title, or items
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
