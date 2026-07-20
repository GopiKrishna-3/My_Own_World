import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/logout`, {
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
        ? `${import.meta.env.VITE_API_BASE_URL}/api/user/profile/data`
        : `${import.meta.env.VITE_API_BASE_URL}/api/user/profile/data/${targetUsername}`;
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

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/user/profile/update`;

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
    return (
        <div className="page-container align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status" style={{color: 'var(--accent-primary)'}}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="premium-card">
            <div className="position-relative mb-4 text-center d-flex justify-content-between align-items-center">
                <button 
                    type="button" 
                    className="btn btn-link p-0 text-muted-dark" 
                    onClick={() => navigate(-1)}
                    title="Go Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <h4 className="m-0 fw-bold flex-grow-1">Profile</h4>
                {isOwnProfile && (
                    <div className="position-relative">
                        <button 
                            className="btn btn-link p-0 text-muted-dark" 
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                        {showSettings && (
                            <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm border-0 rounded-3" style={{ minWidth: '150px', zIndex: 1100, backgroundColor: 'var(--bg-tertiary)' }}>
                                <button className="dropdown-item d-flex align-items-center py-2 text-primary" onClick={() => { setIsEditing(true); setShowSettings(false); }}>
                                    Edit Profile
                                </button>
                                <button className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={handleSignOut}>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="text-center mb-4">
                <div 
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '80px', height: '80px', backgroundColor: 'var(--accent-primary)', fontSize: '32px', color: 'white', fontWeight: 'bold' }}
                >
                    {formData.username.substring(0,2).toUpperCase()}
                </div>
                <h5 className="fw-bold">{formData.username}</h5>
            </div>

            {!isEditing ? (
                <div className="px-md-4">
                    <div className="list-item-dark">
                        <span className="text-muted-dark fw-bold">Username</span>
                        <span>{formData.username}</span>
                    </div>
                    <div className="list-item-dark">
                        <span className="text-muted-dark fw-bold">Email</span>
                        <span>{formData.email}</span>
                    </div>
                    <div className="list-item-dark">
                        <span className="text-muted-dark fw-bold">Phone</span>
                        <span>{formData.phone || 'Not provided'}</span>
                    </div>
                    <div className="list-item-dark">
                        <span className="text-muted-dark fw-bold">Gender</span>
                        <span>{formData.gender || 'Not provided'}</span>
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-muted-dark fw-bold d-block mb-2">Bio</span>
                        <p className="fst-italic" style={{ whiteSpace: 'pre-wrap' }}>{formData.bio || 'Not provided'}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="px-md-4">
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label text-muted-dark fw-bold">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            className="form-control-dark w-100 opacity-50"
                            disabled
                        />
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label text-muted-dark fw-bold">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            className="form-control-dark w-100 opacity-50"
                            disabled
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label text-muted-dark fw-bold">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-control-dark w-100"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="gender" className="form-label text-muted-dark fw-bold">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="form-control-dark w-100"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="bio" className="form-label text-muted-dark fw-bold">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="form-control-dark w-100"
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        <button type="submit" className="btn-primary-accent" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        
                        {(formData.phone || formData.bio) && (
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setMessage(''); }}
                                className="btn-outline-accent"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {message && (
                <div className={`mt-4 alert border-0 text-center ${message.includes('successfully') ? 'alert-success bg-success bg-opacity-10 text-success' : 'alert-danger bg-danger bg-opacity-10 text-danger'}`}>
                    {message}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
