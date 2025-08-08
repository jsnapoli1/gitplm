import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function App() {
  const [categories, setCategories] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [description, setDescription] = useState('');
  const [sources, setSources] = useState([{ manufacturer: '', mpn: '' }]);
  const [revision, setRevision] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE}/v1/categories.json`)
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => {
        console.error('Failed to load categories', err);
      });
  }, []);

  const loadParts = id => {
    setSelectedCategory(id);
    axios
      .get(`${API_BASE}/v1/parts/category/${id}.json`)
      .then(res => {
        setParts(res.data);
      })
      .catch(err => {
        console.error('Failed to load parts', err);
      });
  };

  const loadPartDetail = id => {
    axios
      .get(`${API_BASE}/v1/parts/${id}.json`)
      .then(res => {
        const detail = res.data;
        setSelectedPart(detail);
        setDescription(detail.fields?.Description?.value || '');
        const srcs = [];
        let idx = 1;
        while (true) {
          const mKey = idx === 1 ? 'Manufacturer' : `Manufacturer${idx}`;
          const pKey = idx === 1 ? 'MPN' : `MPN${idx}`;
          const m = detail.fields?.[mKey]?.value;
          const p = detail.fields?.[pKey]?.value;
          if (!m && !p) break;
          srcs.push({ manufacturer: m || '', mpn: p || '' });
          idx++;
        }
        if (srcs.length === 0) srcs.push({ manufacturer: '', mpn: '' });
        setSources(srcs);
        setRevision(detail.revision || '');
      })
      .catch(err => {
        console.error('Failed to load part', err);
      });
  };

  const updateSource = (idx, field, value) => {
    const newSources = sources.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s
    );
    setSources(newSources);
  };

  const addSource = () => {
    setSources([...sources, { manufacturer: '', mpn: '' }]);
  };

  const savePart = () => {
    if (!selectedPart) return;
    axios
      .put(`${API_BASE}/v1/parts/${selectedPart.id}.json`, {
        description,
        sources,
      })
      .then(res => {
        setSelectedPart(res.data);
        loadParts(selectedCategory);
      })
      .catch(err => console.error('Failed to save part', err));
  };

  const startRevision = () => {
    if (!selectedPart) return;
    axios
      .post(`${API_BASE}/v1/parts/${selectedPart.id}/revision`)
      .then(res => {
        loadParts(selectedCategory);
        loadPartDetail(res.data.id);
      })
      .catch(err => console.error('Failed to start revision', err));
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>GitPLM</h1>
      {selectedPart ? (
        <div>
          <h2>Edit Part {selectedPart.id}</h2>
          <p>Revision: {revision}</p>
          <div>
            <label>
              Description
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          <h3>Sources</h3>
          {sources.map((src, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <input
                placeholder="Manufacturer"
                value={src.manufacturer}
                onChange={e => updateSource(idx, 'manufacturer', e.target.value)}
              />
              <input
                placeholder="MPN"
                value={src.mpn}
                onChange={e => updateSource(idx, 'mpn', e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </div>
          ))}
          <button onClick={addSource}>Add Source</button>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={savePart}>Save</button>
            <button onClick={startRevision} style={{ marginLeft: '0.5rem' }}>
              Start New Revision
            </button>
            <button
              onClick={() => setSelectedPart(null)}
              style={{ marginLeft: '0.5rem' }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <h2>Categories</h2>
            <ul>
              {categories.map(cat => (
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
                <li key={part.id}>
                  <button onClick={() => loadPartDetail(part.id)}>
                    {part.id}
                    {part.name ? ` - ${part.name}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
