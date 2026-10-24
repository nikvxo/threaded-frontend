// src/pages/OutfitsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import './OutfitsPage.css';
import ImageModal from '../components/ImageModal.jsx';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

function validateOutfitForm({ title, selectedFile, wornOn }) {
  if (!title.trim()) return 'A title is required.';
  if (!selectedFile) return 'An outfit image is required.';
  if (!VALID_IMAGE_TYPES.includes(selectedFile.type)) {
    return 'Use a PNG, JPEG, or GIF image.';
  }
  if (selectedFile.size > MAX_IMAGE_SIZE) {
    return 'Images must be 10 MB or smaller.';
  }
  if (wornOn && wornOn > new Date().toISOString().split('T')[0]) {
    return 'The date worn cannot be in the future.';
  }

  return null;
}

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
        const data = await apiRequest('/api/outfits', { token });
        setOutfits(data);
      } catch (err) {
        console.error(err);
        setError(`Could not load outfits: ${err.message}`);
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
    const validationError = validateOutfitForm({ title, selectedFile, wornOn });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadData = await apiRequest('/api/upload', {
        method: 'POST',
        token,
        body: formData,
      });
      const newImageUrl = uploadData.imageUrl;

      const itemNames = itemsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const newOutfit = await apiRequest('/api/outfits', {
        method: 'POST',
        token,
        body: {
          title: title.trim(),
          itemNames,
          imageUrl: newImageUrl,
          wornOn: wornOn ? `${wornOn}T12:00:00.000Z` : new Date().toISOString(),
        },
      });
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
      await apiRequest(`/api/outfits/${id}`, {
        method: 'DELETE',
        token,
      });

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

        const uploadData = await apiRequest('/api/upload', {
          method: 'POST',
          token,
          body: formData,
        });
        finalImageUrl = uploadData.imageUrl;
      }

      const itemNames = editingItemsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await apiRequest(`/api/outfits/${id}`, {
        method: 'PUT',
        token,
        body: {
          title: editingTitle.trim(),
          itemNames,
          imageUrl: finalImageUrl,
          wornOn: editingWornOn ? `${editingWornOn}T12:00:00.000Z` : undefined,
        },
      });
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

        <form onSubmit={handleSubmit} className="add-outfit-form" noValidate>
          <h2>Add New Outfit</h2>
          <label htmlFor="outfit-title">Title</label>
          <input
            id="outfit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe your outfit..."
          />
          <label htmlFor="outfit-items">Clothing items</label>
          <input
            id="outfit-items"
            value={itemsInput}
            onChange={(e) => setItemsInput(e.target.value)}
            placeholder="Clothing items (comma separated: blue jeans, white t-shirt)"
          />
          <label htmlFor="outfit-worn-on">Date worn</label>
          <input
            id="outfit-worn-on"
            type="date"
            value={wornOn}
            onChange={(e) => setWornOn(e.target.value)}
            placeholder="Date worn"
          />
          <label htmlFor="outfit-image">Outfit image</label>
          <input
            id="outfit-image"
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
                  <img src={editingImageUrl} alt={editingTitle} />
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
                    src={o.imageUrl}
                    alt={o.title}
                    onClick={() => setModalImageUrl(o.imageUrl)}
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
