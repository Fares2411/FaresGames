import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllGames, healthCheck } from '../services/api';

function Home() {
  const [stats, setStats] = useState({
    games_count: 0,
    status: 'loading'
  });
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const health = await healthCheck();
        setStats(health);

        const gamesData = await getAllGames(6, 0);
        setFeaturedGames(gamesData.games || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading FaresGames...</div>;
  }

  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">🎮 Welcome to FaresGames</h1>
        <p className="hero-subtitle">
          Your Ultimate Video Games Database (2020-2025)
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{stats.games_count || 252}</div>
            <div className="hero-stat-label">Games Available</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">19</div>
            <div className="hero-stat-label">Platforms</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">291</div>
            <div className="hero-stat-label">Companies</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">✨ Featured Games</h2>
        <div className="grid">
          {featuredGames.map((game) => (
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
                      ⭐ {game.overallMobyScore}/10
                    </span>
                  )}
                  {game.overallCriticsScore && (
                    <span className="score-badge">
                      🎯 {game.overallCriticsScore}/100
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">🚀 Quick Actions</h2>
        <div className="stats-grid">
          <Link to="/register" className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-value">👤</div>
            <div className="stat-label">Register Account</div>
          </Link>
          <Link to="/add-rating" className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-value">⭐</div>
            <div className="stat-label">Rate a Game</div>
          </Link>
          <Link to="/top-games" className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-value">🏆</div>
            <div className="stat-label">View Top Games</div>
          </Link>
          <Link to="/dream-game" className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-value">✨</div>
            <div className="stat-label">Dream Game</div>
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">📊 Analytics & Insights</h2>
        <div className="grid">
          <Link to="/top-developers" className="grid-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>🏢 Top Developers</h3>
            <p>Best development companies by critics rating</p>
          </Link>
          <Link to="/top-directors" className="grid-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>🎬 Top Directors</h3>
            <p>Most prolific game directors</p>
          </Link>
          <Link to="/top-collaborations" className="grid-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>🤝 Top Collaborations</h3>
            <p>Director-Developer partnerships</p>
          </Link>
          <Link to="/platform-stats" className="grid-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>📱 Platform Statistics</h3>
            <p>Games and ratings by platform</p>
          </Link>
        </div>
      </div>

      <footer style={{ textAlign: 'center', color: 'white', padding: '2rem', marginTop: '3rem' }}>
        <p>© 2025 FaresGames - Fundamentals of Database Systems Project</p>
        <p>Milestone 3 - Video Games Database Application</p>
      </footer>
    </div>
  );
}

export default Home;