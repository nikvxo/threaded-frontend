// src/pages/OutfitsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { useAuth } from '../hooks/useAuth.js';
import './OutfitsPage.css';
import ImageModal from '../components/ImageModal.jsx';

function OutfitsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [outfits, setOutfits] = useState([]);
  const [title, setTitle] = useState('');
  const [itemsInput, setItemsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [wornOn, setWornOn] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingItemsInput, setEditingItemsInput] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [editingSelectedFile, setEditingSelectedFile] = useState(null);
  const [editingWornOn, setEditingWornOn] = useState('');

  const [modalImageUrl, setModalImageUrl] = useState(null);


  useEffect(() => {
    async function loadOutfits() {
      try {
        setError(null);
        const res = await fetch(`${API_URL}/api/outfits`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to load outfits');
        const data = await res.json();
        setOutfits(data);
      } catch (err) {
        console.error(err);
        setError('Could not load outfits');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadOutfits();
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !selectedFile) {
      setError('Title and image are required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Image upload failed');
      const uploadData = await uploadRes.json();
      const newImageUrl = uploadData.imageUrl;

      const itemNames = itemsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`${API_URL}/api/outfits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          itemNames,
          imageUrl: newImageUrl,
          wornOn: wornOn ? `${wornOn}T12:00:00.000Z` : new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create outfit');

      const newOutfit = await res.json();
      setOutfits((prev) => [newOutfit, ...prev]);
      
      // Reset form fields
      setTitle('');
      setItemsInput('');
      setSelectedFile(null);
      setWornOn('');
      // Also reset the file input visually
      e.target.reset();

    } catch (err) {
      console.error(err);
      setError(`Could not create outfit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/outfits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete outfit');

      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete outfit');
    }
  }

  function startEdit(outfit) {
    setEditingId(outfit.id);
    setEditingTitle(outfit.title);
    setEditingItemsInput(outfit.items?.map(item => item.name).join(', ') || '');
    setEditingImageUrl(outfit.imageUrl || '');
    setEditingSelectedFile(null);
    setEditingWornOn(outfit.wornOn ? new Date(outfit.wornOn).toISOString().split('T')[0] : '');
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle('');
    setEditingItemsInput('');
    setEditingSelectedFile(null);
    setEditingWornOn('');
  }

  async function handleSaveEdit(id) {
    if (!editingTitle.trim()) return;

    setError(null);

    try {
      let finalImageUrl = editingImageUrl;

      if (editingSelectedFile) {
        const formData = new FormData();
        formData.append('image', editingSelectedFile);

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('New image upload failed');
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }

      const itemNames = editingItemsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`${API_URL}/api/outfits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
          itemNames,
          imageUrl: finalImageUrl,
          wornOn: editingWornOn ? `${editingWornOn}T12:00:00.000Z` : undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to update outfit');

      const updated = await res.json();
      setOutfits((prev) => prev.map((o) => (o.id === id ? updated : o)));
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError(`Could not update outfit: ${err.message}`);
    }
  }

  const normalizedSearch = search.toLowerCase();

  const filteredOutfits = outfits.filter((o) => {
      if (!normalizedSearch) return true;

      const inTitle = o.title.toLowerCase().includes(normalizedSearch);
      const inItems = Array.isArray(o.items)
        ? o.items.some((item) =>
            item.name.toLowerCase().includes(normalizedSearch)
          )
        : false;

      return inTitle || inItems;
    });

  return (
    <>
      <main className="outfits-page">
        <header>
          <div>
            <h1>Threaded!</h1>
            {user && <p>Logged in as <strong>{user.email}</strong></p>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate('/closet')}>View Closet</button>
            <button onClick={logout}>Log out</button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="add-outfit-form">
          <h2>Add New Outfit</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe your outfit..."
          />
          <input
            value={itemsInput}
            onChange={(e) => setItemsInput(e.target.value)}
            placeholder="Clothing items (comma separated: blue jeans, white t-shirt)"
          />
          <input
            type="date"
            value={wornOn}
            onChange={(e) => setWornOn(e.target.value)}
            placeholder="Date worn"
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Outfit'}
          </button>
        </form>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or item..."
          className="search-bar"
        />

        {loading && (
          <div className="loading-state">
            <p>Loading your outfits...</p>
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {!loading && !error && filteredOutfits.length === 0 && outfits.length === 0 && (
          <div className="empty-state">
            <h2>No outfits yet!</h2>
            <p>Start building your digital wardrobe by adding your first outfit above.</p>
          </div>
        )}

        {!loading && !error && filteredOutfits.length === 0 && outfits.length > 0 && (
          <div className="empty-state">
            <h2>No matches found</h2>
            <p>Try a different search term.</p>
          </div>
        )}

        <div className="outfits-grid">
          {filteredOutfits.map((o) => (
            <div key={o.id} className="outfit-card">
              {editingId === o.id ? (
                <div className="edit-outfit-form">
                  <h2>Edit Outfit</h2>
                  <img src={`${API_URL}${editingImageUrl}`} alt={editingTitle} />
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    value={editingItemsInput}
                    onChange={(e) => setEditingItemsInput(e.target.value)}
                    placeholder="Clothing items (comma separated)"
                  />
                  <input
                    type="date"
                    value={editingWornOn}
                    onChange={(e) => setEditingWornOn(e.target.value)}
                    placeholder="Date worn"
                  />
                  <label>Replace image:</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => setEditingSelectedFile(e.target.files[0])}
                  />
                  <div className="outfit-card-actions">
                    <button onClick={() => handleSaveEdit(o.id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={`${API_URL}${o.imageUrl}`}
                    alt={o.title}
                    onClick={() => setModalImageUrl(`${API_URL}${o.imageUrl}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="outfit-card-content">
                    <h3>{o.title}</h3>
                    <p>
                      Worn on: {new Date(o.wornOn).toLocaleDateString()}
                    </p>
                    {o.items?.length > 0 && (
                      <div className="outfit-card-tags">
                        {o.items.map((item) => (
                          <span key={item.id}>{item.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="outfit-card-actions">
                      <button onClick={() => startEdit(o)}>Edit</button>
                      <button onClick={() => handleDelete(o.id)}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
      <ImageModal
        imageUrl={modalImageUrl}
        alt="Full size outfit"
        onClose={() => setModalImageUrl(null)}
      />
    </>
  );
}

export default OutfitsPage;
