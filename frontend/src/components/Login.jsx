import React, { useState } from 'react';
import { loginUser } from './api';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(username, password);
      onLogin(true);
      navigate('/home');
      setError('');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="premium-card" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--accent-primary)' }}>Login</h2>

        {error && <div className="alert alert-danger border-0">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label text-muted-dark">Username</label>
            <input
              type="text"
              id="username"
              className="form-control-dark w-100"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label text-muted-dark">Password</label>
            <input
              type="password"
              id="password"
              className="form-control-dark w-100"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary-accent w-100 py-2">
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-muted-dark mb-0">
          Don&apos;t have an account? <Link to="/signup" className="text-decoration-none fw-bold" style={{ color: 'var(--accent-primary)' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
