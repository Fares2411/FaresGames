import React, { useState } from 'react';
import { getTopDirectors } from '../services/api';
function TopDirectors() {
  const [limit, setLimit] = useState(5);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await getTopDirectors(limit);
      setDirectors(data.directors || []);
      if (data.directors && data.directors.length > 0) {
        setMessage({
          type: 'success',
          text: `✅ Found ${data.directors.length} top director(s)`,
        });
      } else {
        setMessage({
          type: 'info',
          text: 'ℹ️ No directors found.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Failed to fetch top directors.',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">🎬 Top Game Directors</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Best game directors ranked by the volume of games they've directed
        </p>
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Number of Directors</label>
              <select
                className="form-select"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Loading...' : '🔍 Find Top Directors'}
            </button>
          </div>
        </form>
        {directors.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Director Name</th>
                  <th>Games Directed</th>
                  <th>Sample Games</th>
                </tr>
              </thead>
              <tbody>
                {directors.map((director, index) => (
                  <tr key={director.PersonID}>
                    <td>
                      <strong style={{
                        fontSize: '1.2rem',
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#667eea'
                      }}>
                        #{index + 1}
                      </strong>
                    </td>
                    <td><strong>{director.DirectorName}</strong></td>
                    <td>
                      <span className="score-badge">
                        🎮 {director.GameCount} game(s)
                      </span>
                    </td>
                    <td style={{ maxWidth: '400px', fontSize: '0.9rem', color: '#666' }}>
                      {director.Games ? director.Games.split(', ').slice(0, 3).join(', ') : 'N/A'}
                      {director.Games && director.Games.split(', ').length > 3 && '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default TopDirectors;