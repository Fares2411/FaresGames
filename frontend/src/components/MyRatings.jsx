import React, { useState } from 'react';
import { getUserRatings, deleteRating, verifyPassword } from '../services/api';

function MyRatings() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      
      await fetchRatings();
      
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
    setRatings([]);
    setMessage({ type: '', text: '' });
  };

  const fetchRatings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await getUserRatings(credentials.email);
      setRatings(data);
      
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No ratings found. Start rating some games!' });
      } else {
        setMessage({ type: 'success', text: `Found ${data.length} rating(s)` });
      }
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to fetch ratings.',
      });
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId, platformName) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await deleteRating(credentials.email, gameId, platformName);
      setMessage({ type: 'success', text: 'Rating deleted successfully' });
      // Refresh ratings
      await fetchRatings();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete rating.',
      });
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '');
    return `${stars} ${rating}/5.0`;
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="card-title">My Ratings</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please login to view your game ratings
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
              {authLoading ? 'Authenticating...' : 'Login & View Ratings'}
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
          <h2 className="card-title" style={{ marginBottom: 0 }}>My Ratings</h2>
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

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={fetchRatings}
          className="btn btn-primary"
          disabled={loading}
          style={{ marginBottom: '1.5rem' }}
        >
          {loading ? 'Loading...' : 'Refresh Ratings'}
        </button>

        {ratings.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Game Title</th>
                  <th>Platform</th>
                  <th>Your Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr key={`${rating.game_id}-${rating.platform_name}`}>
                    <td><strong>{rating.game_title}</strong></td>
                    <td>{rating.platform_name}</td>
                    <td>{renderStars(parseFloat(rating.rating))}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(rating.game_id, rating.platform_name)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
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

export default MyRatings;