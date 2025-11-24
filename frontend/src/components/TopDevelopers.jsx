import React, { useState, useEffect } from 'react';
import { getTopDevelopers, getGenres } from '../services/api';
function TopDevelopers() {
  const [filters, setFilters] = useState({
    genre: '',
    limit: 5,
  });
  const [developers, setDevelopers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genresLoading, setGenresLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  useEffect(() => {
    fetchGenres();
  }, []);
  const fetchGenres = async () => {
    try {
      const data = await getGenres();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setGenresLoading(false);
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
      const data = await getTopDevelopers(filters.genre || null, filters.limit);
      setDevelopers(data.developers || []);
      if (data.developers && data.developers.length > 0) {
        setMessage({
          type: 'success',
          text: `Found ${data.developers.length} top developer(s)`,
        });
      } else {
        setMessage({
          type: 'info',
          text: 'No developers found with the selected filters.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch top developers.',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Top Development Companies</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Best development companies ranked by critics rating
        </p>
        {genresLoading && <p>Loading genres...</p>}
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
                disabled={genresLoading}
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
          <button type="submit" className="btn btn-primary" disabled={loading || genresLoading}>
            {loading ? 'Loading...' : 'Find Top Developers'}
          </button>
        </form>
        {developers.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Company Name</th>
                  <th>Country</th>
                  <th>Avg Critics Score</th>
                  <th>Games Developed</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((dev, index) => (
                  <tr key={dev.CompanyID}>
                    <td>
                      <strong style={{
                        fontSize: '1.2rem',
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#667eea'
                      }}>
                        #{index + 1}
                      </strong>
                    </td>
                    <td><strong>{dev.CompanyName}</strong></td>
                    <td>{dev.Country || 'N/A'}</td>
                    <td>
                      <span className="score-badge">
                        {parseFloat(dev.AvgCriticsScore).toFixed(1)}/100
                      </span>
                    </td>
                    <td>{dev.GameCount} game(s)</td>
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
export default TopDevelopers;