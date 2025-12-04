import { useEffect, useState } from 'react';

function App() {
  const [outfits, setOutfits] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/outfits');
        if (!res.ok) throw new Error('Failed to load outfits');
        const data = await res.json();
        setOutfits(data);
      } catch (err) {
        console.error(err);
        setError('Could not load outfits');
      } finally {
        setLoading(false);
      }
    };

    loadOutfits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), tags: [] }),
      });

      if (!res.ok) throw new Error('Failed to create outfit');

      const newOutfit = await res.json();
      setOutfits(prev => [newOutfit, ...prev]);
      setTitle('');
    } catch (err) {
      console.error(err);
      setError('Could not create outfit');
    }
  };

  const handleDelete = async (id) => {
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/outfits/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete outfit');

      setOutfits(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete outfit');
    }
  };

  const startEdit = (outfit) => {
    setEditingId(outfit.id);
    setEditingTitle(outfit.title);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSaveEdit = async (id) => {
    if (!editingTitle.trim()) return;

    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/outfits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim(), tags: [] }),
      });

      if (!res.ok) throw new Error('Failed to update outfit');

      const updated = await res.json();
      setOutfits(prev =>
        prev.map(o => (o.id === id ? updated : o))
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError('Could not update outfit');
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>FitPlanner</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Describe your outfit..."
          style={{ padding: '0.5rem', width: '70%', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Add
        </button>
      </form>

      {loading && <p>Loading outfits...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {outfits.map(o => (
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
                <input
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  style={{ flex: 1, padding: '0.25rem' }}
                />
                <button onClick={() => handleSaveEdit(o.id)} style={{ marginRight: '0.25rem' }}>
                  Save
                </button>
                <button onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>{o.title}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => startEdit(o)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(o.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
