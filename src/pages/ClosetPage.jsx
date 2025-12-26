// src/pages/ClosetPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { useAuth } from '../hooks/useAuth.js';
import './ClosetPage.css';

function ClosetPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemOutfits, setItemOutfits] = useState([]);

  useEffect(() => {
    async function loadItems() {
      try {
        setError(null);
        
        // Fetch both clothing items and outfits
        const [clothingRes, outfitsRes] = await Promise.all([
          fetch(`${API_URL}/api/clothing`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/outfits`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        if (!clothingRes.ok || !outfitsRes.ok) {
          throw new Error('Failed to load closet');
        }
        
        const clothingItems = await clothingRes.json();
        const outfits = await outfitsRes.json();
        
        // Calculate usage count for each item
        const itemsWithUsage = clothingItems.map(item => {
          const usageCount = outfits.filter(outfit => 
            outfit.items && outfit.items.some(i => i.id === item.id)
          ).length;
          
          return {
            ...item,
            usageCount
          };
        }).sort((a, b) => b.usageCount - a.usageCount);
        
        setItems(itemsWithUsage);
      } catch (err) {
        console.error(err);
        setError('Could not load your closet');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadItems();
    }
  }, [token]);

  async function viewItemOutfits(item) {
    setSelectedItem(item);
    try {
      // Fetch all outfits and filter by this clothing item
      const res = await fetch(`${API_URL}/api/outfits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load outfits');
      const allOutfits = await res.json();
      
      // Filter outfits that contain this item
      const filtered = allOutfits.filter(outfit => 
        outfit.items && outfit.items.some(i => i.id === item.id)
      ).sort((a, b) => new Date(b.wornOn) - new Date(a.wornOn));
      
      setItemOutfits(filtered);
    } catch (err) {
      console.error(err);
      setError('Could not load outfits for this item');
    }
  }

  async function handleDeleteItem(itemId) {
    if (!confirm('Delete this item from your closet?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/clothing/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Failed to delete item');
      
      // Remove from state
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      // If this was the selected item, clear selection
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setItemOutfits([]);
      }
    } catch (err) {
      console.error(err);
      setError('Could not delete item');
    }
  }

  return (
    <main className="closet-page">
      <header>
        <div>
          <h1>Your Virtual Closet</h1>
          {user && <p>Logged in as <strong>{user.email}</strong></p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => navigate('/outfits')}>View Outfits</button>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      {loading && (
        <div className="loading-state">
          <p>Loading your closet...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <h2>Your closet is empty!</h2>
          <p>Add outfits to automatically build your virtual closet.</p>
          <button onClick={() => navigate('/outfits')}>Add Your First Outfit</button>
        </div>
      )}

      {!loading && !error && items.length > 0 && !selectedItem && (
        <div className="closet-content">
          <div className="closet-stats">
            <h2>{items.length} Clothing Items</h2>
            <p>Click any item to see all outfits you've worn it with</p>
          </div>
          
          <div className="items-grid">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="item-card"
              >
                <div onClick={() => viewItemOutfits(item)} style={{ cursor: 'pointer', flex: 1 }}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-count">{item.usageCount} outfit{item.usageCount !== 1 ? 's' : ''}</div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="delete-item-btn"
                  title="Delete item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="item-detail">
          <button onClick={() => setSelectedItem(null)} className="back-button">
            ← Back to Closet
          </button>
          
          <h2>Outfits with "{selectedItem.name}"</h2>
          <p className="outfit-count">{itemOutfits.length} outfit{itemOutfits.length !== 1 ? 's' : ''} found</p>

          <div className="outfits-grid">
            {itemOutfits.map((outfit) => (
              <div key={outfit.id} className="outfit-card">
                <img src={`${API_URL}${outfit.imageUrl}`} alt={outfit.title} />
                <div className="outfit-card-content">
                  <h3>{outfit.title}</h3>
                  <p className="date">
                    {new Date(outfit.wornOn).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  {outfit.items?.length > 0 && (
                    <div className="outfit-tags">
                      {outfit.items.map((item) => (
                        <span 
                          key={item.id}
                          className={item.id === selectedItem.id ? 'highlighted' : ''}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default ClosetPage;
