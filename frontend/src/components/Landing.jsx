import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Users, MessageSquare, Settings } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    // Check if logged in and redirect
    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'var(--bg-primary)' }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <span className="navbar-brand fw-bold text-white fs-4 m-0" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        My Own <span style={{ color: 'var(--accent-primary)' }}>World</span>
                    </span>
                    <div className="d-flex gap-3">
                        <button className="btn btn-outline-accent rounded-pill px-4" onClick={() => navigate('/login')}>Login</button>
                        <button className="btn btn-primary-accent rounded-pill px-4" onClick={() => navigate('/signup')}>Sign Up</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-3 py-5" style={{ background: 'radial-gradient(circle at 50% 0%, #1e293b, #0f172a 80%)' }}>
                <h1 className="fw-bold mb-3" style={{ fontSize: '3.5rem', maxWidth: '800px', letterSpacing: '-0.02em', color: 'white' }}>
                    Your world, your people, your posts.
                </h1>
                <p className="text-muted-dark fs-5 mb-5" style={{ maxWidth: '600px' }}>
                    Connect with friends, share your thoughts, and build a vibrant community in a space designed just for you.
                </p>
                <button className="btn btn-primary-accent rounded-pill px-5 py-3 fs-5 shadow" onClick={() => navigate('/signup')}>
                    Get Started for Free
                </button>
            </div>

            {/* Features Section */}
            <div className="container py-5 mb-5">
                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card h-100 text-center">
                            <div className="mb-3 d-inline-flex justify-content-center align-items-center rounded-circle" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                                <Edit3 size={30} />
                            </div>
                            <h5 className="fw-bold mb-2">Express Yourself</h5>
                            <p className="text-muted-dark mb-0 fs-6">Share rich text, images, and videos with your personalized feed.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card h-100 text-center">
                            <div className="mb-3 d-inline-flex justify-content-center align-items-center rounded-circle" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                                <Users size={30} />
                            </div>
                            <h5 className="fw-bold mb-2">Connect</h5>
                            <p className="text-muted-dark mb-0 fs-6">Find and add friends, track requests, and build your network.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card h-100 text-center">
                            <div className="mb-3 d-inline-flex justify-content-center align-items-center rounded-circle" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                                <MessageSquare size={30} />
                            </div>
                            <h5 className="fw-bold mb-2">Real-time Chat</h5>
                            <p className="text-muted-dark mb-0 fs-6">Stay in touch instantly with our seamless messaging system.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card h-100 text-center">
                            <div className="mb-3 d-inline-flex justify-content-center align-items-center rounded-circle" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                                <Settings size={30} />
                            </div>
                            <h5 className="fw-bold mb-2">Your Profile</h5>
                            <p className="text-muted-dark mb-0 fs-6">Customize your bio, gender, and personal information easily.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center border-top" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                <p className="text-muted-dark mb-0">© {new Date().getFullYear()} My Own World. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
