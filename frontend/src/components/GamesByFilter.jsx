import React, { useState, useEffect } from 'react';
import { 
  getGamesByFilter, 
  getGenres, 
  getPlatforms, 
  getDevelopers, 
  getPublishers,
  getReleaseYears 
} from '../services/api';
function GamesByFilter() {
  const [filters, setFilters] = useState({
    genre: '',
    platform: '',
    publisher: '',
    developer: '',
    year: '',
    sort_by: 'moby_score',
    limit: '',
  });
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [years, setYears] = useState([]);
  const [metadataLoading, setMetadataLoading] = useState(true);
  useEffect(() => {
    fetchAllMetadata();
  }, []);
  const fetchAllMetadata = async () => {
    setMetadataLoading(true);
    try {
      const [genresData, platformsData, developersData, publishersData, yearsData] = await Promise.all([
        getGenres(),
        getPlatforms(),
        getDevelopers(),
        getPublishers(),
        getReleaseYears()
      ]);
      setGenres(genresData.genres || []);
      setPlatforms(platformsData.platforms || []);
      setDevelopers(developersData.developers || []);
      setPublishers(publishersData.publishers || []);
      setYears(yearsData.years || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setMessage({ type: 'error', text: 'Failed to load filter options' });
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
      const params = {};
      if (filters.genre) params.genre = filters.genre;
      if (filters.platform) params.platform = filters.platform;
      if (filters.publisher) params.publisher = filters.publisher;
      if (filters.developer) params.developer = filters.developer;
      if (filters.year) params.year = parseInt(filters.year);
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.limit) params.limit = parseInt(filters.limit);
      const data = await getGamesByFilter(params);
      setGames(data.games || []);
      if (data.games && data.games.length > 0) {
        setMessage({
          type: 'success',
          text: `Found ${data.games.length} game(s)`,
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
        text: 'Failed to fetch games.',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Browse Games by Filter</h2>
        {metadataLoading && <p>Loading filter options...</p>}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="filter-item">
              <label className="form-label">Genre</label>
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
              <label className="form-label">Platform</label>
              <select
                name="platform"
                className="form-select"
                value={filters.platform}
                onChange={handleFilterChange}
                disabled={metadataLoading}
              >
                <option value="">All Platforms</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label className="form-label">Publisher</label>
              <select
                name="publisher"
                className="form-select"
                value={filters.publisher}
                onChange={handleFilterChange}
                disabled={metadataLoading}
              >
                <option value="">All Publishers</option>
                {publishers.map((pub) => (
                  <option key={pub} value={pub}>
                    {pub}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label className="form-label">Developer</label>
              <select
                name="developer"
                className="form-select"
                value={filters.developer}
                onChange={handleFilterChange}
                disabled={metadataLoading}
              >
                <option value="">All Developers</option>
                {developers.map((dev) => (
                  <option key={dev} value={dev}>
                    {dev}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label className="form-label">Year</label>
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
              <label className="form-label">Sort By</label>
              <select
                name="sort_by"
                className="form-select"
                value={filters.sort_by}
                onChange={handleFilterChange}
              >
                <option value="moby_score">Moby Score (High to Low)</option>
                <option value="title">Title (A-Z)</option>
                <option value="critics_score">Critics Score</option>
                <option value="players_score">Players Score</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="form-label">Limit Results</label>
              <select
                name="limit"
                className="form-select"
                value={filters.limit}
                onChange={handleFilterChange}
              >
                <option value="">No Limit (All Results)</option>
                <option value="10">10 games</option>
                <option value="25">25 games</option>
                <option value="50">50 games</option>
                <option value="100">100 games</option>
                <option value="250">250 games</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || metadataLoading}>
            {loading ? 'Searching...' : 'Search Games'}
          </button>
        </form>
        {games.length > 0 && (
          <div className="grid" style={{ marginTop: '2rem' }}>
            {games.map((game) => (
              <div key={game.GameID} className="game-card">
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
                    {game.overallMobyScore && (
                      <span className="score-badge">
                        {game.overallMobyScore}/10
                      </span>
                    )}
                    {game.overallCriticsScore && (
                      <span className="score-badge" style={{ background: '#28a745' }}>
                        {game.overallCriticsScore}/100
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
export default GamesByFilter;