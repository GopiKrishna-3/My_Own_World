import React, { useState } from 'react';
import { signUpUser } from './api';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await signUpUser(username, email, password);
      navigate('/login');
      setError('');
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="premium-card" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--accent-primary)' }}>Sign Up</h2>
        
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

          <div className="mb-3">
            <label htmlFor="email" className="form-label text-muted-dark">Email</label>
            <input
              type="email"
              id="email"
              className="form-control-dark w-100"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
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

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label text-muted-dark">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control-dark w-100"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary-accent w-100 py-2">
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-muted-dark mb-0">
          Already have an account? <Link to="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--accent-primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
