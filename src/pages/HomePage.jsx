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
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Threaded!</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        Your digital wardrobe assistant. Track your outfits and never forget what you wore.
      </p>
      <div>
        <Link 
          to="/login" 
          style={{ 
            padding: '0.75rem 2rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem'
          }}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
