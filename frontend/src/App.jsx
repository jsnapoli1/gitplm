import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function App() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newPartId, setNewPartId] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/v1/categories.json`).then(res => {
      setCategories(res.data);
      setFilteredCategories(res.data);
    }).catch(err => {
      console.error('Failed to load categories', err);
    });
  }, []);

  const loadParts = (id) => {
    if (id === selectedCategory) {
      return;
    }
    setSelectedCategory(id);
    setParts([]);
    axios.get(`${API_BASE}/v1/parts/category/${id}.json`).then(res => {
      if (Array.isArray(res.data)) {
        setParts(res.data);
      } else {
        console.error('Unexpected parts response', res.data);
        setParts([]);
      }
    }).catch(err => {
      console.error('Failed to load parts', err);
      setParts([]);
    });
  };

  const createPart = () => {
    if (!selectedCategory || !newPartId) return;
    axios.post(`${API_BASE}/v1/parts.json`, {
      id: newPartId,
      name: newPartName,
      category: selectedCategory,
    }).then(() => {
      setNewPartId('');
      setNewPartName('');
      loadParts(selectedCategory);
    }).catch(err => {
      console.error('Failed to create part', err);
    });
  const handleFilter = () => {
    const term = searchTerm.toLowerCase();
    setFilteredCategories(
      categories.filter(cat =>
        cat.id.toLowerCase().includes(term) ||
        (cat.name || '').toLowerCase().includes(term)
      )
    );
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>GitPLM</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h2>Categories</h2>
          <div style={{ marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search categories"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button onClick={handleFilter} style={{ marginLeft: '0.5rem' }}>Filter</button>
          </div>
          <ul>
            {filteredCategories.map(cat => (
              <li key={cat.id}>
                <button onClick={() => loadParts(cat.id)}>
                  {cat.id} - {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Parts {selectedCategory ? `for ${selectedCategory}` : ''}</h2>
          <ul>
            {parts.map(part => (
              <li key={part.id}>{part.id}{part.name ? ` - ${part.name}` : ''}</li>
            ))}
          </ul>
          {selectedCategory && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Create Part</h3>
              <input
                placeholder="Part ID"
                value={newPartId}
                onChange={e => setNewPartId(e.target.value)}
              />
              <input
                placeholder="Part Name"
                value={newPartName}
                onChange={e => setNewPartName(e.target.value)}
              />
              <button onClick={createPart}>Create Part</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
