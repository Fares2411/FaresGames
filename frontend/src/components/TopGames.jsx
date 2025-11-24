import React, { useState, useEffect } from 'react';
import { getTopGames, getGenres, getReleaseYears } from '../services/api';
function TopGames() {
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating_type: 'critics',
    limit: 10,
  });
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  useEffect(() => {
    fetchMetadata();
    fetchTopGames();
  }, []);
  const fetchMetadata = async () => {
    try {
      const [genresData, yearsData] = await Promise.all([
        getGenres(),
        getReleaseYears()
      ]);
      setGenres(genresData.genres || []);
      setYears(yearsData.years || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setMetadataLoading(false);
    }
  };
  const fetchTopGames = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const params = {
        rating_type: filters.rating_type,
        limit: filters.limit,
      };
      if (filters.genre) params.genre = filters.genre;
      if (filters.year) params.year = parseInt(filters.year);
      const data = await getTopGames(params);
      setGames(data.games || []);
      if (data.games && data.games.length > 0) {
        setMessage({
          type: 'success',
          text: `Found ${data.games.length} top-rated game(s)`,
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
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTopGames();
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Top Rated Games</h2>
        {metadataLoading && <p>Loading filter options...</p>}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="filter-item">
              <label className="form-label">Rating Type</label>
              <select
                name="rating_type"
                className="form-select"
                value={filters.rating_type}
                onChange={handleFilterChange}
              >
                <option value="critics">Critics Score</option>
                <option value="players">Players Score</option>
              </select>
            </div>
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
              <label className="form-label">Year (Optional)</label>
              <select
                name="year"
                className="form-select"
                value={filters.year}
                onChange={handleFilterChange}
                disabled={metadataLoading}
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
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
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || metadataLoading}>
            {loading ? 'Loading...' : 'Search Top Games'}
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
                  <div className="game-score">
                    <span className="score-badge">
                      {filters.rating_type === 'critics'
                        ? `${game.Score}/100`
                        : `${game.Score}/5.0`}
                    </span>
                    {game.RatingCount && (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {game.RatingCount} ratings
                      </span>
                    )}
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
export default TopGames;