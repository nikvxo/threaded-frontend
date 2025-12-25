// src/components/OutfitsPage.jsx
import { useEffect, useState } from 'react';
import { API_URL } from '../config.js';
import { useAuth } from '../hooks/useAuth.js';
import './OutfitsPage.css';
import ImageModal from './ImageModal.jsx';

function OutfitsPage() {
  const { user, token, logout } = useAuth();

  const [outfits, setOutfits] = useState([]);
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [mood, setMood] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTagsInput, setEditingTagsInput] = useState('');
  const [editingMood, setEditingMood] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [editingSelectedFile, setEditingSelectedFile] = useState(null);

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

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`${API_URL}/api/outfits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), tags, mood, imageUrl: newImageUrl }),
      });

      if (!res.ok) throw new Error('Failed to create outfit');

      const newOutfit = await res.json();
      setOutfits((prev) => [newOutfit, ...prev]);
      
      // Reset form fields
      setTitle('');
      setTagsInput('');
      setMood('');
      setSelectedFile(null);
      // Also reset the file input visually
      e.target.reset();

    } catch (err) {
      console.error(err);
      setError(`Could not create outfit: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    // ... (no changes needed here)
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
    setEditingTagsInput(outfit.tags?.join(', ') || '');
    setEditingMood(outfit.mood || '');
    setEditingImageUrl(outfit.imageUrl || '');
    // --- NEW: Reset the edit file state when starting a new edit ---
    setEditingSelectedFile(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle('');
    setEditingTagsInput('');
    setEditingMood('');
    // --- NEW: Reset the edit file state on cancel ---
    setEditingSelectedFile(null);
  }

  // --- MODIFIED: handleSaveEdit now handles optional file upload ---
  async function handleSaveEdit(id) {
    if (!editingTitle.trim()) return;

    setError(null);

    try {
      let finalImageUrl = editingImageUrl;

      // If a new file was selected during edit, upload it first
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
        finalImageUrl = uploadData.imageUrl; // Use the newly uploaded image URL
      }

      const tags = editingTagsInput
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
          tags,
          mood: editingMood,
          imageUrl: finalImageUrl, // Use either the new or existing URL
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
      const inTags = Array.isArray(o.tags)
        ? o.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch)
          )
        : false;

      return inTitle || inTags;
    });

  return (
    <>
      <main className="outfits-page">
        <header>
          <div>
            <h1>FitPlanner</h1>
            {user && <p>Logged in as <strong>{user.email}</strong></p>}
          </div>
          <button onClick={logout}>Log out</button>
        </header>

        <form onSubmit={handleSubmit} className="add-outfit-form">
          <h2>Add New Outfit</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe your outfit..."
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma separated: casual, summer, date)"
          />
          <input
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Mood (confident, cozy, etc.)"
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button type="submit">Add</button>
        </form>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or tag..."
          className="search-bar"
        />

        {loading && <p>Loading outfits...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

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
                    value={editingTagsInput}
                    onChange={(e) => setEditingTagsInput(e.target.value)}
                    placeholder="Tags (comma separated)"
                  />
                  <input
                    value={editingMood}
                    onChange={(e) => setEditingMood(e.target.value)}
                    placeholder="Mood"
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
                      {o.mood && <span>Mood: {o.mood}</span>}
                      {o.createdAt && (
                        <span>
                          {' '}
                          · {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {o.tags?.length > 0 && (
                      <div className="outfit-card-tags">
                        {o.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
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
