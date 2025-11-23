import React, { useState, useEffect } from 'react';
import { getDreamGame } from '../services/api';

function DreamGame() {
  const [dreamGame, setDreamGame] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDreamGame();
  }, []);

  const fetchDreamGame = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await getDreamGame();
      setDreamGame(data.dream_game);
      setStats(data.stats);
      setMessage({
        type: 'success',
        text: 'Dream game specs generated based on player ratings!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to generate dream game. Make sure there are user ratings in the database.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="card-title">Dream Game</h2>
          <p style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '2rem' }}>
            Generating your dream game...
          </p>
        </div>
      </div>
    );
  }

  const InfoCard = ({ title, value, rating }) => (
    <div className="grid-item" style={{ textAlign: 'center' }}>
      <h3 style={{ 
        color: 'var(--text-primary)', 
        fontSize: '0.9rem', 
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '1.3rem', 
        fontWeight: 'bold', 
        color: 'var(--navbar-border)',
        marginBottom: '0.5rem'
      }}>
        {value}
      </p>
      {rating > 0 && (
        <span className="score-badge" style={{ fontSize: '0.85rem' }}>
          {rating.toFixed(2)}/5.0
        </span>
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Dream Game - Perfect Game Specs</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Based on the highest-rated attributes from player ratings
        </p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {dreamGame && (
          <>
            {/* Core Game Design */}
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginTop: '2rem', 
              marginBottom: '1rem',
              borderBottom: '2px solid var(--navbar-border)',
              paddingBottom: '0.5rem'
            }}>
              Core Game Design
            </h3>
            <div className="grid">
              <InfoCard title="Genre" value={dreamGame.genre} rating={stats.genre_rating} />
              <InfoCard title="Gameplay" value={dreamGame.gameplay} rating={stats.gameplay_rating} />
              <InfoCard title="Pacing" value={dreamGame.pacing} rating={stats.pacing_rating} />
              <InfoCard title="Interface" value={dreamGame.interface} rating={stats.interface_rating} />
            </div>

            {/* Story & Setting */}
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginTop: '2rem', 
              marginBottom: '1rem',
              borderBottom: '2px solid var(--navbar-border)',
              paddingBottom: '0.5rem'
            }}>
              Story & Setting
            </h3>
            <div className="grid">
              <InfoCard title="Setting" value={dreamGame.setting} rating={stats.setting_rating} />
              <InfoCard title="Narrative" value={dreamGame.narrative} rating={stats.narrative_rating} />
            </div>

            {/* Visual Presentation */}
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginTop: '2rem', 
              marginBottom: '1rem',
              borderBottom: '2px solid var(--navbar-border)',
              paddingBottom: '0.5rem'
            }}>
              Visual Presentation
            </h3>
            <div className="grid">
              <InfoCard title="Perspective" value={dreamGame.perspective} rating={stats.perspective_rating} />
              <InfoCard title="Visual Style" value={dreamGame.visual_style} rating={stats.visual_rating} />
              {dreamGame.art_style !== 'N/A' && (
                <InfoCard title="Art Style" value={dreamGame.art_style} rating={stats.art_rating} />
              )}
            </div>

            {/* Platform & Distribution */}
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginTop: '2rem', 
              marginBottom: '1rem',
              borderBottom: '2px solid var(--navbar-border)',
              paddingBottom: '0.5rem'
            }}>
              Platform & Distribution
            </h3>
            <div className="grid">
              <InfoCard title="Platform" value={dreamGame.platform} rating={stats.platform_rating} />
              <InfoCard title="Business Model" value={dreamGame.business_model} rating={stats.business_model_rating} />
              <InfoCard title="Media Type" value={dreamGame.media_type} rating={stats.media_type_rating} />
            </div>

            {/* Development Team */}
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginTop: '2rem', 
              marginBottom: '1rem',
              borderBottom: '2px solid var(--navbar-border)',
              paddingBottom: '0.5rem'
            }}>
              Development Team
            </h3>
            <div className="grid">
              <InfoCard title="Developer" value={dreamGame.developer} rating={stats.developer_rating} />
              <InfoCard title="Publisher" value={dreamGame.publisher} rating={stats.publisher_rating} />
              <InfoCard title="Director" value={dreamGame.director} rating={stats.director_rating} />
            </div>

            {/* Input & Controls - UPDATED: Single field now */}
            {dreamGame.input_device_supported && (
              <>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginTop: '2rem', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid var(--navbar-border)',
                  paddingBottom: '0.5rem'
                }}>
                  Input & Controls
                </h3>
                <div className="grid">
                  <InfoCard 
                    title="Input Device" 
                    value={dreamGame.input_device_supported} 
                    rating={stats.input_supported_rating} 
                  />
                </div>
              </>
            )}

            {/* Additional Features (only if applicable) */}
            {(dreamGame.sport_type || dreamGame.vehicular_type || dreamGame.educational_focus || 
              dreamGame.misc_features || dreamGame.addon_type) && (
              <>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginTop: '2rem', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid var(--navbar-border)',
                  paddingBottom: '0.5rem'
                }}>
                  Additional Features
                </h3>
                <div className="grid">
                  {dreamGame.sport_type && (
                    <InfoCard title="Sport Type" value={dreamGame.sport_type} rating={stats.sport_rating} />
                  )}
                  {dreamGame.vehicular_type && (
                    <InfoCard title="Vehicular" value={dreamGame.vehicular_type} rating={stats.vehicular_rating} />
                  )}
                  {dreamGame.educational_focus && (
                    <InfoCard title="Educational" value={dreamGame.educational_focus} rating={stats.educational_rating} />
                  )}
                  {dreamGame.misc_features && (
                    <InfoCard title="Misc Features" value={dreamGame.misc_features} rating={stats.misc_rating} />
                  )}
                  {dreamGame.addon_type && (
                    <InfoCard title="Add-on Type" value={dreamGame.addon_type} rating={stats.addon_rating} />
                  )}
                </div>
              </>
            )}

            {/* Special Features & Rating */}
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginTop: '2rem', 
              marginBottom: '1rem',
              borderBottom: '2px solid var(--navbar-border)',
              paddingBottom: '0.5rem'
            }}>
              Ratings & Special Features
            </h3>
            <div className="grid">
              <InfoCard 
                title={`${dreamGame.maturity_organization} Rating`} 
                value={dreamGame.maturity_rating} 
                rating={stats.maturity_rating} 
              />
              {dreamGame.special_edition_features && (
                <InfoCard title="Special Edition" value={dreamGame.special_edition_features} rating={stats.special_edition_rating} />
              )}
            </div>

            {/* Summary */}
            <div className="stat-card" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'white' }}>
                Your Dream Game Formula
              </h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'white' }}>
                A <strong>{dreamGame.genre}</strong> game with <strong>{dreamGame.gameplay}</strong> gameplay,
                set in a <strong>{dreamGame.setting}</strong> world with <strong>{dreamGame.narrative}</strong> narrative,
                featuring <strong>{dreamGame.perspective}</strong> perspective and <strong>{dreamGame.visual_style}</strong> visuals.
                Developed by <strong>{dreamGame.developer}</strong>, published by <strong>{dreamGame.publisher}</strong>,
                directed by <strong>{dreamGame.director}</strong>, released as <strong>{dreamGame.business_model}</strong> on <strong>{dreamGame.media_type}</strong> for <strong>{dreamGame.platform}</strong>.
                {dreamGame.input_device_supported && (
                  <> Best played with <strong>{dreamGame.input_device_supported}</strong>.</>
                )}
                {' '}Rated <strong>{dreamGame.maturity_rating}</strong> by <strong>{dreamGame.maturity_organization}</strong>.
              </p>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button onClick={fetchDreamGame} className="btn btn-primary">
                Regenerate Dream Game
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DreamGame;