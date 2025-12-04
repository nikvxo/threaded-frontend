import { useEffect, useState } from 'react';

function App() {
  const [outfits, setOutfits] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            }}
          >
            {o.title}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
