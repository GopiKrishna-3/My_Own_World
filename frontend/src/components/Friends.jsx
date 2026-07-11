import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileImage from '../assets/profile2.jpg';

const Friends = () => {
    const navigate = useNavigate();
    const access = localStorage.getItem('accessToken');
    const [activeTab, setActiveTab] = useState('find'); // find, pending, friends
    const [users, setUsers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myFriends, setMyFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!access) {
            navigate('/');
            return;
        }
        if (activeTab === 'find') fetchUsers(searchQuery);
        if (activeTab === 'pending') fetchPendingRequests();
        if (activeTab === 'friends') fetchMyFriends();
    }, [activeTab, access]);

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `http://127.0.0.1:8000/api/user/friends/search?q=${query}` : 'http://127.0.0.1:8000/api/user/friends/search';
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(searchQuery);
    };

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/friends/pending', {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) setPendingRequests(await res.json());
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const fetchMyFriends = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/friends/list', {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) setMyFriends(await res.json());
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const sendRequest = async (toUserId) => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/friends/request/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({ to_user_id: toUserId })
            });
            if (res.ok) fetchUsers(searchQuery);
        } catch (error) { console.error(error); }
    };

    const respondRequest = async (fromUserId, action) => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/friends/request/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({ from_user_id: fromUserId, action })
            });
            if (res.ok) fetchPendingRequests();
        } catch (error) { console.error(error); }
    };

    const tabStyle = (tabName) => ({
        cursor: 'pointer',
        padding: '10px 20px',
        fontWeight: 'bold',
        color: activeTab === tabName ? '#111' : '#666',
        borderBottom: activeTab === tabName ? '3px solid rgb(241, 137, 52)' : 'none',
        flex: 1,
        textAlign: 'center'
    });

    return (
        <div style={{
            backgroundImage: `url(${profileImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            color: 'white',
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <div className="position-relative mb-4 text-center">
                    <button 
                        type="button" 
                        className="btn btn-link p-0 text-dark position-absolute start-0 top-50 translate-middle-y" 
                        style={{ textDecoration: 'none', fontSize: '28px' }} 
                        onClick={() => navigate(-1)}
                        title="Go Back"
                    >
                        &#8592;
                    </button>
                    <h2 className="m-0 d-inline-block fw-bold text-black">Friends</h2>
                </div>

                <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                    <div style={tabStyle('find')} onClick={() => setActiveTab('find')}>Find Friends</div>
                    <div style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>Requests ({pendingRequests.length > 0 ? pendingRequests.length : 0})</div>
                    <div style={tabStyle('friends')} onClick={() => setActiveTab('friends')}>My Friends</div>
                </div>

                {loading ? <p className="text-center text-dark fw-bold">Loading...</p> : (
                    <div>
                        {activeTab === 'find' && (
                            <div>
                                <form onSubmit={handleSearch} className="d-flex mb-3">
                                    <input
                                        type="text"
                                        className="form-control me-2"
                                        placeholder="Search users by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                                    />
                                    <button className="btn" style={{ backgroundColor: 'rgb(241, 137, 52)', color: 'white', fontWeight: 'bold' }} type="submit">Search</button>
                                </form>
                                <ul className="list-group">
                                    {users.length === 0 && <p className="text-dark fw-bold">No other users found.</p>}
                                    {users.map(u => (
                                        <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-dark text-dark fw-bold">
                                            {u.username}
                                            {u.status === 'none' && (
                                                <button className="btn btn-sm btn-primary" onClick={() => sendRequest(u.id)}>Add Friend</button>
                                            )}
                                            {u.status === 'request_sent' && <span className="badge bg-secondary">Request Sent</span>}
                                            {u.status === 'request_received' && <span className="badge bg-warning text-dark">Respond in Requests</span>}
                                            {u.status === 'friends' && <span className="badge bg-success">Friends</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'pending' && (
                            <ul className="list-group">
                                {pendingRequests.length === 0 && <p className="text-dark fw-bold">No pending requests.</p>}
                                {pendingRequests.map(u => (
                                    <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-dark text-dark fw-bold">
                                        {u.username}
                                        <div>
                                            <button className="btn btn-sm btn-success me-2" onClick={() => respondRequest(u.id, 'accept')}>Accept</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => respondRequest(u.id, 'reject')}>Reject</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {activeTab === 'friends' && (
                            <ul className="list-group">
                                {myFriends.length === 0 && <p className="text-dark fw-bold">You haven't added any friends yet.</p>}
                                {myFriends.map(u => (
                                    <li key={u.id} className="list-group-item bg-transparent border-dark text-dark fw-bold">
                                        {u.username}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
