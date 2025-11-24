import React, { useState, useEffect } from 'react';
import { addRating, verifyPassword, getPlatforms, getGamesList, getGamePlatforms } from '../services/api';
function AddRating() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    game_id: '',
    platform_name: '',
    rating: 5.0,
  });
  const [allPlatforms, setAllPlatforms] = useState([]); 
  const [availablePlatforms, setAvailablePlatforms] = useState([]); 
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [useDropdown, setUseDropdown] = useState(true); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [platformsLoading, setPlatformsLoading] = useState(false)
  useEffect(() => {
    fetchMetadata();
  }, []);
  const fetchMetadata = async () => {
    setMetadataLoading(true);
    try {
      const [platformsData, gamesData] = await Promise.all([
        getPlatforms(),
        getGamesList()
      ]);
      setAllPlatforms(platformsData.platforms || []);
      setAvailablePlatforms(platformsData.platforms || []); 
      setGames(gamesData.games || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setMessage({ type: 'error', text: 'Failed to load platforms and games' });
    } finally {
      setMetadataLoading(false);
    }
  };
  const fetchGamePlatforms = async (gameId) => {
    setPlatformsLoading(true);
    try {
      const data = await getGamePlatforms(gameId);
      setAvailablePlatforms(data.platforms || []);
      if (formData.platform_name && !data.platforms.includes(formData.platform_name)) {
        setFormData(prev => ({ ...prev, platform_name: '' }));
      }
    } catch (error) {
      console.error('Error fetching game platforms:', error);
      setMessage({ 
        type: 'warning', 
        text: 'Could not load platforms for this game. Please try again.' 
      });
      setAvailablePlatforms(allPlatforms); 
    } finally {
      setPlatformsLoading(false);
    }
  };
  const handleCredentialChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await verifyPassword(credentials.email, credentials.password);
      setIsAuthenticated(true);
      setUserName(response.username);
      setMessage({
        type: 'success',
        text: `Welcome back, ${response.username}! You can now add ratings.`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Authentication failed. Please check your credentials.',
      });
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ email: '', password: '' });
    setUserName('');
    setFormData({ game_id: '', platform_name: '', rating: 5.0 });
    setSelectedGame(null);
    setSearchQuery('');
    setAvailablePlatforms(allPlatforms);
    setMessage({ type: '', text: '' });
  };
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      const filtered = games.filter(game =>
        game.Title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGames(filtered.slice(0, 20)); 
    } else {
      setFilteredGames([]);
    }
  };
  const selectGameFromSearch = (game) => {
    setSelectedGame(game);
    setFormData({
      ...formData,
      game_id: game.GameID,
      platform_name: '', 
    });
    setSearchQuery(game.Title);
    setFilteredGames([]);
    fetchGamePlatforms(game.GameID);
  };
  const handleGameDropdownChange = (e) => {
    const gameId = e.target.value;
    if (gameId) {
      const game = games.find(g => g.GameID === parseInt(gameId));
      setSelectedGame(game);
      setFormData({
        ...formData,
        game_id: parseInt(gameId),
        platform_name: '', 
      });
      fetchGamePlatforms(parseInt(gameId));
    } else {
      setSelectedGame(null);
      setFormData({
        ...formData,
        game_id: '',
        platform_name: '',
      });
      setAvailablePlatforms(allPlatforms); 
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const ratingData = {
        user_email: credentials.email,
        game_id: parseInt(formData.game_id),
        platform_name: formData.platform_name,
        rating: parseFloat(formData.rating),
      };
      const response = await addRating(ratingData);
      setMessage({
        type: 'success',
        text: `Successfully rated "${response.game_title}" on ${response.platform_name} - ${response.rating}/5.0`,
      });
      setFormData({
        ...formData,
        platform_name: '',
        rating: 5.0,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to add rating. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="card-title">Add Game Rating</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please login to add ratings to games
          </p>
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={credentials.email}
                onChange={handleCredentialChange}
                required
                placeholder="user@example.com"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={credentials.password}
                onChange={handleCredentialChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={authLoading}
            >
              {authLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Add Game Rating</h2>
          <div>
            <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>
              Logged in as: <strong>{userName}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Logout
            </button>
          </div>
        </div>
        {metadataLoading && <p>Loading games and platforms...</p>}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Game Selection */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Select Game *</label>
              <button
                type="button"
                onClick={() => {
                  setUseDropdown(!useDropdown);
                  setSelectedGame(null);
                  setFormData({ ...formData, game_id: '', platform_name: '' });
                  setSearchQuery('');
                  setFilteredGames([]);
                  setAvailablePlatforms(allPlatforms);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                {useDropdown ? 'Switch to Search' : 'Switch to Dropdown'}
              </button>
            </div>
            {useDropdown ? (
              <>
                <select
                  className="form-select"
                  value={formData.game_id}
                  onChange={handleGameDropdownChange}
                  required
                  disabled={metadataLoading}
                >
                  <option value="">Select a game</option>
                  {games.map((game) => (
                    <option key={game.GameID} value={game.GameID}>
                      {game.Title}
                    </option>
                  ))}
                </select>
                {selectedGame && (
                  <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                    Selected: <strong>{selectedGame.Title}</strong>
                  </div>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  className="form-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Start typing game name..."
                />
                {filteredGames.length > 0 && (
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {filteredGames.map((game) => (
                      <div
                        key={game.GameID}
                        onClick={() => selectGameFromSearch(game)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'var(--bg-hover)'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                      >
                        <strong>{game.Title}</strong>
                      </div>
                    ))}
                  </div>
                )}
                {selectedGame && (
                  <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                    Selected: <strong>{selectedGame.Title}</strong>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Platform Selection - Now Dynamic! */}
          <div className="form-group">
            <label className="form-label">
              Platform * 
              {platformsLoading && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>(Loading...)</span>}
              {selectedGame && !platformsLoading && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  ({availablePlatforms.length} available)
                </span>
              )}
            </label>
            <select
              name="platform_name"
              className="form-select"
              value={formData.platform_name}
              onChange={handleChange}
              required
              disabled={metadataLoading || platformsLoading || !selectedGame}
            >
              <option value="">
                {!selectedGame 
                  ? 'Select a game first' 
                  : platformsLoading 
                    ? 'Loading platforms...' 
                    : 'Select a platform'}
              </option>
              {availablePlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
          {/* Rating Slider */}
          <div className="form-group">
            <label className="form-label">
              Your Rating: {formData.rating}/5.0
            </label>
            <input
              type="range"
              name="rating"
              className="form-input"
              min="0"
              max="5"
              step="0.5"
              value={formData.rating}
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '0.5rem', 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)' 
            }}>
              <span>0.0</span>
              <span>1.0</span>
              <span>2.0</span>
              <span>3.0</span>
              <span>4.0</span>
              <span>5.0</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedGame || !formData.platform_name || metadataLoading || platformsLoading}
          >
            {loading ? 'Adding Rating...' : 'Add Rating'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default AddRating;