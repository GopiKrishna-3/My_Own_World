import { useNavigate } from 'react-router-dom';
import blogImage from '../assets/homes.jpg'; // Correct path if the image is in src/assets/

const Home = ({ onSignOut }) => {
    const navigate = useNavigate();
    const user = localStorage.getItem('username');

    return (
        <>

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
