import React, { useState } from 'react';
import { getTopCollaborations } from '../services/api';
function TopCollaborations() {
  const [limit, setLimit] = useState(5);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await getTopCollaborations(limit);
      setCollaborations(data.collaborations || []);
      if (data.collaborations && data.collaborations.length > 0) {
        setMessage({
          type: 'success',
          text: `✅ Found ${data.collaborations.length} top collaboration(s)`,
        });
      } else {
        setMessage({
          type: 'info',
          text: 'ℹ️ No collaborations found.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Failed to fetch top collaborations.',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">🤝 Top Director-Developer Collaborations</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Most successful partnerships between game directors and development companies
        </p>
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Number of Collaborations</label>
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
              {loading ? 'Loading...' : '🔍 Find Top Collaborations'}
            </button>
          </div>
        </form>
        {collaborations.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Director</th>
                  <th>Developer Company</th>
                  <th>Games Together</th>
                  <th>Sample Games</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((collab, index) => (
                  <tr key={index}>
                    <td>
                      <strong style={{
                        fontSize: '1.2rem',
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#667eea'
                      }}>
                        #{index + 1}
                      </strong>
                    </td>
                    <td><strong>{collab.DirectorName}</strong></td>
                    <td><strong>{collab.DeveloperName}</strong></td>
                    <td>
                      <span className="score-badge">
                        🎮 {collab.CollaborationCount} game(s)
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.9rem', color: '#666' }}>
                      {collab.Games ? collab.Games.split(', ').slice(0, 2).join(', ') : 'N/A'}
                      {collab.Games && collab.Games.split(', ').length > 2 && '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {collaborations.length > 0 && (
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginTop: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>💡 Insights</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              These collaborations represent the strongest partnerships in the gaming industry,
              where directors and development companies have worked together on multiple projects,
              often resulting in critically acclaimed titles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default TopCollaborations;