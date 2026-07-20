import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('username');
    const access = localStorage.getItem('accessToken');
    
    const [pendingRequests, setPendingRequests] = useState([]);
    const [circlesCount, setCirclesCount] = useState(0);
    const [postsCount, setPostsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!access) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [access, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Pending Requests
            const reqRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/pending`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (reqRes.ok) {
                const reqData = await reqRes.json();
                setPendingRequests(reqData.results || reqData);
            }

            // Fetch Circles and calculate total posts count across circles
            const circlesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            
            if (circlesRes.ok) {
                const circlesData = await circlesRes.json();
                setCirclesCount(circlesData.length);

                // Fetch posts counts for each circle in parallel
                const postPromises = circlesData.map(c => 
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts/get/?circle_id=${c.id}`, {
                        headers: { 'Authorization': `Bearer ${access}` }
                    }).then(r => r.ok ? r.json() : [])
                );
                
                const postsLists = await Promise.all(postPromises);
                
                // Collect unique post IDs to avoid double counting posts in multiple circles
                const uniquePostIds = new Set();
                postsLists.forEach(postsList => {
                    const items = postsList.results || postsList;
                    if (Array.isArray(items)) {
                        items.forEach(p => uniquePostIds.add(p.id));
                    }
                });
                setPostsCount(uniquePostIds.size);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
    };

    return (
        <div className="page-container" style={{ paddingTop: '100px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="premium-card text-center mb-4 py-5">
                    <div className="avatar-circle mx-auto mb-3" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                        {user ? user.substring(0,2).toUpperCase() : 'U'}
                    </div>
                    <h2 className="fw-bold mb-3">Welcome back, {user}!</h2>
                    <p className="text-muted-dark fs-5 mb-4">Here's a quick summary of what's happening in your circles.</p>
                    
                    {loading ? (
                        <div className="d-flex justify-content-center mt-4 gap-4">
                            <div className="skeleton skeleton-text" style={{ width: '100px', height: '80px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '100px', height: '80px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '100px', height: '80px' }}></div>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center gap-4 flex-wrap">
                            <div className="p-4 rounded-3 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'rgba(255,255,255,0.05) !important', minWidth: '150px' }}>
                                <h3 className="fw-bold mb-1" style={{ color: 'var(--accent-primary)' }}>{circlesCount}</h3>
                                <div className="text-muted-dark">Your Circles</div>
                                <Link to="/posts" className="btn btn-sm btn-outline-accent mt-3 w-100">View Circles</Link>
                            </div>

                            <div className="p-4 rounded-3 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'rgba(255,255,255,0.05) !important', minWidth: '150px' }}>
                                <h3 className="fw-bold mb-1" style={{ color: 'var(--accent-primary)' }}>{postsCount}</h3>
                                <div className="text-muted-dark">Posts Shared</div>
                                <Link to="/posts" className="btn btn-sm btn-outline-accent mt-3 w-100">View Feed</Link>
                            </div>
                            
                            <div className="p-4 rounded-3 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'rgba(255,255,255,0.05) !important', minWidth: '150px' }}>
                                <h3 className="fw-bold mb-1" style={{ color: pendingRequests.length > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>{pendingRequests.length}</h3>
                                <div className="text-muted-dark">Pending Requests</div>
                                <Link to="/friends" className="btn btn-sm btn-outline-accent mt-3 w-100">View Friends</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
