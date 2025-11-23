import React, { useState, useEffect } from 'react';
import { getTopGamesByMoby, getGenres, getSettings } from '../services/api';

function TopGamesByMoby() {
  const [filters, setFilters] = useState({
    genre: '',
    setting: '',
    limit: 5,
  });
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [genresData, settingsData] = await Promise.all([
        getGenres(),
        getSettings()
      ]);
      setGenres(genresData.genres || []);
      setSettings(settingsData.settings || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setMetadataLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const params = { limit: filters.limit };
      if (filters.genre) params.genre = filters.genre;
      if (filters.setting) params.setting = filters.setting;

      const data = await getTopGamesByMoby(params);
      setGames(data.games || []);
      
      if (data.games && data.games.length > 0) {
        setMessage({
          type: 'success',
          text: `Found ${data.games.length} top game(s) by Moby Score`,
        });
      } else {
        setMessage({
          type: 'info',
          text: 'No games found with the selected filters.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch top games.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Top Games by Moby Score</h2>

        {metadataLoading && <p>Loading filter options...</p>}

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="filter-item">
              <label className="form-label">Genre (Optional)</label>
              <select
                name="genre"
                className="form-select"
                value={filters.genre}
                onChange={handleFilterChange}
                disabled={metadataLoading}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className="form-label">Setting (Optional)</label>
              <select
                name="setting"
                className="form-select"
                value={filters.setting}
                onChange={handleFilterChange}
                disabled={metadataLoading}
              >
                <option value="">All Settings</option>
                {settings.map((setting) => (
                  <option key={setting} value={setting}>
                    {setting}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className="form-label">Limit</label>
              <select
                name="limit"
                className="form-select"
                value={filters.limit}
                onChange={handleFilterChange}
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || metadataLoading}>
            {loading ? 'Loading...' : 'Find Top Games'}
          </button>
        </form>

        {games.length > 0 && (
          <div className="grid" style={{ marginTop: '2rem' }}>
            {games.map((game, index) => (
              <div key={game.GameID} className="game-card">
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: '#FFD700',
                  color: '#333',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  #{index + 1}
                </div>
                <img
                  src={game.CoverPhoto || 'https://via.placeholder.com/300x200?text=No+Cover'}
                  alt={game.Title}
                  className="game-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Cover';
                  }}
                />
                <div className="game-content">
                  <h3 className="game-title">{game.Title}</h3>
                  <p className="game-description">
                    {game.Description
                      ? game.Description.substring(0, 100) + '...'
                      : 'No description available'}
                  </p>
                  <div className="game-score">
                    <span className="score-badge">
                      Moby Score: {game.overallMobyScore}/10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopGamesByMoby;