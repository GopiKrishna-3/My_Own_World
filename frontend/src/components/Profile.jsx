import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import profileImage from '../assets/profile2.jpg';

const Profile = ({ onSignOut }) => {
  const navigate = useNavigate();
  const { username } = useParams();

  const loggedInUser = localStorage.getItem('username');
  const isOwnProfile = !username || username === loggedInUser;
  const targetUsername = username || loggedInUser;
  
  const mail = localStorage.getItem('email');
  const access = localStorage.getItem('accessToken');

  const [formData, setFormData] = useState({
    username: targetUsername,
    email: isOwnProfile ? mail : '',
    phone: '',
    gender: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = async () => {
      try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await fetch('http://127.0.0.1:8000/api/user/logout', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
          });
          if (response.ok) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (onSignOut) onSignOut(false);
              navigate('/');
          }
      } catch (err) {
          console.error('Error signing out:', err);
      }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const apiUrl = isOwnProfile 
        ? 'http://127.0.0.1:8000/api/user/profile/data'
        : `http://127.0.0.1:8000/api/user/profile/data/${targetUsername}`;
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            username: targetUsername,
            email: data.email || (isOwnProfile ? mail : ''),
            phone: data.phone || '',
            gender: data.gender || '',
            bio: data.bio || '',
          });
          
          if (!data.phone && !data.bio) {
            setIsEditing(true);
          }
        } else {
          console.error('Failed to fetch profile data');
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setIsEditing(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [targetUsername, isOwnProfile, mail, access]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const apiUrl = 'http://127.0.0.1:8000/api/user/profile/update';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false); // Switch back to view mode on success
      } else {
        setMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while updating the profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateHome = () => {
    navigate('/home');
  };

  if (initialLoading) {
    return <div style={{ textAlign: 'center', color: 'pink', fontSize: '20px' }}>Loading profile...</div>;
  }

  return (
    <div
      style={{
        backgroundImage: `url(${profileImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        color: 'white',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <div className="position-relative mb-4 text-center d-flex justify-content-between align-items-center">
          <button 
            type="button" 
            className="btn btn-link p-0 text-dark" 
            style={{ textDecoration: 'none', fontSize: '28px' }} 
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            &#8592;
          </button>
          <h2 className="m-0 fw-bold text-black flex-grow-1">Profile Page</h2>
          {isOwnProfile && (
            <div className="position-relative">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowSettings(!showSettings)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                ⚙️ Settings
              </button>
              {showSettings && (
                <div className="position-absolute bg-white border rounded shadow p-2 mt-2" style={{ right: 0, top: '100%', zIndex: 1100, width: '150px' }}>
                  <button
                    className="btn btn-light w-100 mb-1"
                    onClick={() => { setIsEditing(true); setShowSettings(false); }}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="btn btn-danger w-100"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing ? (
          <div>
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>Username</label>
              <p style={{ fontSize: '18px', color: '#111', margin: 0 }}>{formData.username}</p>
            </div>
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>Email</label>
              <p style={{ fontSize: '18px', color: '#111', margin: 0 }}>{formData.email}</p>
            </div>
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>Phone Number</label>
              <p style={{ fontSize: '18px', color: '#111', margin: 0 }}>{formData.phone || 'Not provided'}</p>
            </div>
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>Gender</label>
              <p style={{ fontSize: '18px', color: '#111', margin: 0 }}>{formData.gender || 'Not provided'}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>Bio</label>
              <p style={{ fontSize: '18px', color: '#111', margin: 0, whiteSpace: 'pre-wrap' }}>{formData.bio || 'Not provided'}</p>
            </div>
            
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
                disabled
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
                disabled
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'rgb(255,255,255)',
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="gender" style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'rgb(255,255,255)',
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="bio" style={{ display: 'block', marginBottom: '5px', color: 'black', fontWeight: 'bold' }}>
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'rgb(255,255,255)',
                }}
                rows="4"
              ></textarea>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: 'rgb(241, 137, 52)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              
              {/* Optional cancel button if they want to discard changes (only if they have data) */}
              {(formData.phone || formData.bio) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage('');
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {message && (
          <div
            style={{
              marginTop: '20px',
              color: message.includes('successfully') ? 'green' : 'red',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {message}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              color: 'black',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={handleNavigateHome}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
