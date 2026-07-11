import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onSignOut }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.error('No refresh token found');
                return;
            }
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
                onSignOut(false);
                navigate('/');
            } else {
                const errorData = await response.json();
                console.error('Logout failed:', errorData.error);
            }
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" style={styles.navbar}>
            <div className="container-fluid">
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <button className="nav-link btn" style={styles.navButton} onClick={() => navigate('/home')}>
                                Home
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" style={styles.navButton} onClick={() => navigate('/profile')}>
                                Profile
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" style={styles.navButton} onClick={() => navigate('/posts')}>
                                Posts
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" style={styles.navButton} onClick={() => navigate('/user-post')}>
                                My Posts
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" style={styles.navButton} onClick={() => navigate('/add-post')}>
                                Add Posts
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" style={styles.navButton} onClick={() => navigate('/friends')}>
                                Friends
                            </button>
                        </li>
                    </ul>
                </div>
                <button
                    className="btn btn-danger ms-auto"
                    style={styles.signOutButton}
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#343a40',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1050,
    },
    navButton: {
        color: '#ffffff',
        margin: '0 5px',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
        cursor: 'pointer',
    },
    signOutButton: {
        backgroundColor: '#dc3545',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        color: '#ffffff',
        transition: 'background-color 0.3s',
    },
};

export default Navbar;
