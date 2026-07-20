import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onSignOut }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div className="container">
                <span className="navbar-brand fw-bold text-white fs-4" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/home')}>
                    My Own <span style={{ color: 'var(--accent-primary)' }}>World</span>
                </span>
                
                <button className="navbar-toggler" type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                    <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
                </button>
                
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item mx-1">
                            <button className={`nav-link btn ${location.pathname === '/home' ? 'text-white fw-bold' : 'text-muted-dark'}`} onClick={() => handleNavigate('/home')}>
                                Home
                            </button>
                        </li>
                        <li className="nav-item mx-1">
                            <button className={`nav-link btn ${location.pathname === '/posts' ? 'text-white fw-bold' : 'text-muted-dark'}`} onClick={() => handleNavigate('/posts')}>
                                Feed
                            </button>
                        </li>
                        <li className="nav-item mx-1">
                            <button className={`nav-link btn ${location.pathname === '/add-post' ? 'text-white fw-bold' : 'text-muted-dark'}`} onClick={() => handleNavigate('/add-post')}>
                                Create Post
                            </button>
                        </li>
                        <li className="nav-item mx-1">
                            <button className={`nav-link btn ${location.pathname === '/friends' || location.pathname === '/chat' ? 'text-white fw-bold' : 'text-muted-dark'}`} onClick={() => handleNavigate('/friends')}>
                                Friends & Chat
                            </button>
                        </li>
                    </ul>
                    <div className="d-flex my-2 my-lg-0">
                        <button
                            className="btn btn-primary-accent rounded-pill px-4 w-100 w-lg-auto"
                            onClick={() => handleNavigate('/profile')}
                        >
                            Profile
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
