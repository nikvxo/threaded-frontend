// src/App.jsx
import AuthPanel from './components/AuthPanel.jsx';
import OutfitsPage from './components/OutfitsPage.jsx';
import { useAuth } from './hooks/useAuth.js';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <p style={{ textAlign: 'center', marginTop: '2rem' }}>
        Loading...
      </p>
    );
  }

  return isAuthenticated ? <OutfitsPage /> : <AuthPanel />;
}

export default App;
