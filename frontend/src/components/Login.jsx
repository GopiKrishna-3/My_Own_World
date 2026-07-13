import React, { useState } from 'react';
import { loginUser } from './api'; // import login function
import { useNavigate, Link } from 'react-router-dom';
import loginImage from '../assets/login.jpg'; // Import the background image

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
      navigate('/home'); // Redirect to home page after successful login
      setError('');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${loginImage})`, // Background image applied here
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Ensures the background covers the entire page
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          padding: '30px',
          borderRadius: '15px',
          width: '100%',
          maxWidth: '400px', // Limit width of the form
        }}
      >
        <h2 className="text-center mb-4" style={styles.heading}>Login</h2>

        {error && <div className="alert alert-danger" style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div className="form-group mt-3" style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block mt-4" style={styles.button}>
            Login
          </button>
        </form>

        <p className="mt-3 text-center" style={styles.signUpText}>
          Don&apos;t have an account? <Link to="/signup" style={styles.signUpLink}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '28px',
    color: '#e91e63', // Pink color for the title
    textAlign: 'center',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '16px',
    color: '#495057',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '100%',
    marginTop: '5px',
    transition: 'all 0.3s ease',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e91e63', // Pink background for the button
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  signUpText: {
    fontSize: '14px',
  },
  signUpLink: {
    color: '#e91e63',
    textDecoration: 'none',
  },
};

export default Login;
