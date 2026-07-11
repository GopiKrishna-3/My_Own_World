import { useNavigate } from 'react-router-dom';
import blogImage from '../assets/homes.jpg'; // Correct path if the image is in src/assets/

const Home = ({ onSignOut }) => {
    const navigate = useNavigate();
    const user = localStorage.getItem('username');

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
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                console.error('Logout failed:', errorData.error);
            }
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    return (
        <>
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

            <div
                className="mt-5 pt-5 text-center"
                style={{
                    ...styles.backgroundContainer,
                    backgroundImage: `url(${blogImage})`,
                }}
            >
                <p style={styles.welcomeMessage}>
                    Welcome <span style={styles.username}>{user}</span>
                </p>
            </div>
        </>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#343a40',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
    welcomeMessage: {
        color: '#ffffff',
        fontSize: '2rem',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', // Text shadow for better visibility on blue background
    },
    username: {
        color: '#f8d7da',  // Light red color for the username
        fontStyle: 'italic',
    },
    backgroundContainer: {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        minHeight: '100vh',
        paddingTop: '100px',  // Padding to offset the fixed navbar
        position: 'relative',
        display: 'flex',
        justifyContent: 'center', // Horizontally center the text
        alignItems: 'center',     // Vertically center the text
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.3)',  // Optional semi-transparent overlay for better readability
    },
};

export default Home;
