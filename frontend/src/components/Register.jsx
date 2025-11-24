import React, { useState } from 'react';
import { registerUser } from '../services/api';
function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    birthdate: '',
    country: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
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
      const userData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        birthdate: formData.birthdate || null,
        country: formData.country || null,
      };
      const response = await registerUser(userData);
      setMessage({
        type: 'success',
        text: `✅ Successfully registered user: ${response.username}!`,
      });
      setFormData({
        email: '',
        username: '',
        password: '',
        birthdate: '',
        country: '',
      });
      localStorage.setItem('userEmail', response.email);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || '❌ Failed to register user. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">👤 Register New User</h2>
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="50"
              placeholder="Choose a username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Birthdate</label>
            <input
              type="date"
              name="birthdate"
              className="form-input"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              name="country"
              className="form-input"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., Egypt"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : '✅ Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default Register;