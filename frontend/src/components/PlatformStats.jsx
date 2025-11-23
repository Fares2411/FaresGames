import React, { useState, useEffect } from 'react';
import { getPlatformStats } from '../services/api';

function PlatformStats() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await getPlatformStats();
      setPlatforms(data.platforms || []);
      
      if (data.platforms && data.platforms.length > 0) {
        setMessage({
          type: 'success',
          text: `✅ Loaded statistics for ${data.platforms.length} platform(s)`,
        });
      } else {
        setMessage({
          type: 'info',
          text: 'ℹ️ No platform data available.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Failed to fetch platform statistics.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading platform statistics...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">📊 Platform Statistics</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Number of games available on each platform and their average ratings
        </p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {platforms.length > 0 && (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Games Available</th>
                    <th>Avg Critics Score</th>
                    <th>Avg Players Score</th>
                    <th>Avg Moby Score</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((platform) => (
                    <tr key={platform.PlatformName}>
                      <td><strong>{platform.PlatformName}</strong></td>
                      <td>
                        <span className="score-badge">
                          🎮 {platform.GameCount}
                        </span>
                      </td>
                      <td>
                        {platform.AvgCriticsScore ? (
                          <span style={{ color: '#667eea', fontWeight: '500' }}>
                            🎯 {parseFloat(platform.AvgCriticsScore).toFixed(1)}/100
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {platform.AvgPlayersScore ? (
                          <span style={{ color: '#667eea', fontWeight: '500' }}>
                            ⭐ {parseFloat(platform.AvgPlayersScore).toFixed(1)}/5.0
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {platform.AvgMobyScore ? (
                          <span style={{ color: '#667eea', fontWeight: '500' }}>
                            🏆 {parseFloat(platform.AvgMobyScore).toFixed(1)}/10
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="stats-grid" style={{ marginTop: '2rem' }}>
              <div className="stat-card">
                <div className="stat-value">{platforms.length}</div>
                <div className="stat-label">Total Platforms</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {platforms.reduce((sum, p) => sum + parseInt(p.GameCount), 0)}
                </div>
                <div className="stat-label">Total Game Releases</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {platforms.sort((a, b) => b.GameCount - a.GameCount)[0]?.PlatformName.substring(0, 15)}
                </div>
                <div className="stat-label">Most Games</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button onClick={fetchPlatformStats} className="btn btn-secondary">
                🔄 Refresh Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlatformStats;