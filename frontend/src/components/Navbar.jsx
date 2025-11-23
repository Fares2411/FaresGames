import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🎮 Fares Games
        </Link>
        
        {/* Desktop Navigation */}
        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className="navbar-link" onClick={() => setIsOpen(false)}>
              🏠 Home
            </Link>
          </li>
          
          <li>
            <Link to="/register" className="navbar-link" onClick={() => setIsOpen(false)}>
              👤 Register
            </Link>
          </li>
          
          {/* Ratings Dropdown */}
          <li 
            className={`navbar-dropdown ${activeDropdown === 'ratings' ? 'active' : ''}`}
            onMouseEnter={() => window.innerWidth > 1024 && setActiveDropdown('ratings')}
            onMouseLeave={() => window.innerWidth > 1024 && setActiveDropdown(null)}
          >
            <span 
              className="navbar-link"
              onClick={() => toggleDropdown('ratings')}
            >
              ⭐ Ratings {window.innerWidth <= 1024 ? (activeDropdown === 'ratings' ? '▲' : '▼') : '▼'}
            </span>
            <ul className="dropdown-menu">
              <li>
                <Link to="/add-rating" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  Add Rating
                </Link>
              </li>
              <li>
                <Link to="/my-ratings" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  My Ratings
                </Link>
              </li>
            </ul>
          </li>

          {/* Games Dropdown */}
          <li 
            className={`navbar-dropdown ${activeDropdown === 'games' ? 'active' : ''}`}
            onMouseEnter={() => window.innerWidth > 1024 && setActiveDropdown('games')}
            onMouseLeave={() => window.innerWidth > 1024 && setActiveDropdown(null)}
          >
            <span 
              className="navbar-link"
              onClick={() => toggleDropdown('games')}
            >
              🎮 Games {window.innerWidth <= 1024 ? (activeDropdown === 'games' ? '▲' : '▼') : '▼'}
            </span>
            <ul className="dropdown-menu">
              <li>
                <Link to="/top-games" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  Top Games
                </Link>
              </li>
              <li>
                <Link to="/games-filter" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  Browse Games
                </Link>
              </li>
              <li>
                <Link to="/top-moby" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  Top by Moby
                </Link>
              </li>
            </ul>
          </li>

          {/* Analytics Dropdown */}
          <li 
            className={`navbar-dropdown ${activeDropdown === 'analytics' ? 'active' : ''}`}
            onMouseEnter={() => window.innerWidth > 1024 && setActiveDropdown('analytics')}
            onMouseLeave={() => window.innerWidth > 1024 && setActiveDropdown(null)}
          >
            <span 
              className="navbar-link"
              onClick={() => toggleDropdown('analytics')}
            >
              📊 Analytics {window.innerWidth <= 1024 ? (activeDropdown === 'analytics' ? '▲' : '▼') : '▼'}
            </span>
            <ul className="dropdown-menu">
              <li>
                <Link to="/dream-game" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  ✨ Dream Game
                </Link>
              </li>
              <li>
                <Link to="/top-developers" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  🏢 Top Developers
                </Link>
              </li>
              <li>
                <Link to="/top-directors" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  🎬 Top Directors
                </Link>
              </li>
              <li>
                <Link to="/top-collaborations" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  🤝 Collaborations
                </Link>
              </li>
              <li>
                <Link to="/platform-stats" className="dropdown-link" onClick={() => setIsOpen(false)}>
                  📱 Platform Stats
                </Link>
              </li>
            </ul>
          </li>
        </ul>

        {/* Right side icons */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <span className="theme-icon">☀️</span>
            ) : (
              <span className="theme-icon">🌙</span>
            )}
          </button>

          {/* Hamburger menu for mobile */}
          <button 
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;