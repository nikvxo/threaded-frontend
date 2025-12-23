// src/components/OutfitsPage.jsx
import { useEffect, useState } from 'react';
import { API_URL } from '../config.js';
import { useAuth } from '../hooks/useAuth.js';

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
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            FitPlanner
          </h1>
          {user && (
            <p style={{ fontSize: '0.9rem', color: '#555' }}>
              Logged in as <strong>{user.email}</strong>
            </p>
          )}
        </div>
        <button onClick={logout}>Log out</button>
        <div style={{ marginBottom: '1rem' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or tag..."
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>

      </header>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe your outfit..."
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma separated: casual, summer, date)"
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mood (confident, cozy, etc.)"
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        {/* --- MODIFIED: Changed to a file input --- */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Add
        </button>
      </form>

      {loading && <p>Loading outfits...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredOutfits.map((o) => (
          <li
            key={o.id}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {editingId === o.id ? (
              <>
                <div style={{ flex: 1 }}>
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Title"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.25rem',
                      marginBottom: '0.25rem',
                    }}
                  />
                  <input
                    value={editingTagsInput}
                    onChange={(e) => setEditingTagsInput(e.target.value)}
                    placeholder="Tags (comma separated)"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.25rem',
                      marginBottom: '0.25rem',
                    }}
                  />
                  <input
                    value={editingMood}
                    onChange={(e) => setEditingMood(e.target.value)}
                    placeholder="Mood"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.25rem',
                    }}
                  />
                  {/* --- NEW: File input for editing --- */}
                  <label style={{fontSize: '0.8rem', display: 'block', marginTop: '0.5rem'}}>Replace image:</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => setEditingSelectedFile(e.target.files[0])}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.25rem',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
                <button
                  onClick={() => handleSaveEdit(o.id)}
                  style={{ marginRight: '0.25rem' }}
                >
                  Save
                </button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    <span style={{ fontWeight: 600 }}>{o.title}</span>
                    <br />
                    {o.tags?.length ? (
                      <span>Tags: {o.tags.join(', ')} · </span>
                    ) : null}
                    {o.mood ? <span>Mood: {o.mood} · </span> : null}
                    {o.createdAt ? (
                      <span>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>

                  {/* --- MODIFIED: Use API_URL to build the full image source --- */}
                  {o.imageUrl && (
                    <img
                      src={`${API_URL}${o.imageUrl}`}
                      alt={o.title}
                      style={{
                        marginTop: '0.4rem',
                        maxWidth: '100%',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => startEdit(o)}>Edit</button>
                  <button onClick={() => handleDelete(o.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default OutfitsPage;