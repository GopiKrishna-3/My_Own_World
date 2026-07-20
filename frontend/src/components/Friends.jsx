import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';

const Friends = ({ defaultTab = 'find' }) => {
    const navigate = useNavigate();
    const access = localStorage.getItem('accessToken');
    const [activeTab, setActiveTab] = useState(defaultTab); // find, pending, friends
    const [users, setUsers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myFriends, setMyFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(null);

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
            const url = query ? `${import.meta.env.VITE_API_BASE_URL}/api/user/friends/search?q=${query}` : `${import.meta.env.VITE_API_BASE_URL}/api/user/friends/search`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.results || data);
            }
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
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/pending`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingRequests(data.results || data);
            }
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const fetchMyFriends = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/list`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyFriends(data.results || data);
            }
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const sendRequest = async (toUserId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/request/send`, {
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
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/request/respond`, {
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

    const blockFriend = async () => {
        if (!window.confirm(`Are you sure you want to block ${activeChat.username}?`)) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/block`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: activeChat.username })
            });
            if (res.ok) {
                setActiveChat(null);
                fetchMyFriends();
                fetchUsers();
            } else {
                alert('Failed to block user.');
            }
        } catch(err) { console.error(err); }
    };

    const tabStyle = (tabName) => ({
        cursor: 'pointer',
        padding: '10px 20px',
        fontWeight: '600',
        color: activeTab === tabName ? 'var(--accent-primary)' : 'var(--text-secondary)',
        borderBottom: activeTab === tabName ? '2px solid var(--accent-primary)' : '2px solid transparent',
        flex: 1,
        textAlign: 'center',
        transition: 'all 0.2s ease'
    });

    return (
        <div className="page-container">
            <div className="container" style={{ maxWidth: '800px' }}>
                {activeChat ? (
                    <Chat 
                        activeChat={activeChat} 
                        setActiveChat={setActiveChat} 
                        access={access} 
                        blockFriend={blockFriend} 
                    />
                ) : (
                    <div className="premium-card">
                        <h4 className="premium-card-header fw-bold m-0 text-center">Friends & Connections</h4>

                        <div className="d-flex mb-4 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                            <div style={tabStyle('find')} onClick={() => setActiveTab('find')}>Find Friends</div>
                            <div style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>
                                Requests {pendingRequests.length > 0 && <span className="badge bg-danger ms-1">{pendingRequests.length}</span>}
                            </div>
                            <div style={tabStyle('friends')} onClick={() => setActiveTab('friends')}>My Friends</div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="skeleton skeleton-text w-50 mx-auto"></div>
                                <div className="skeleton skeleton-text w-75 mx-auto mt-2"></div>
                            </div>
                        ) : (
                            <div>
                                {activeTab === 'find' && (
                                    <div>
                                        <form onSubmit={handleSearch} className="d-flex mb-4 gap-2">
                                            <input
                                                type="text"
                                                className="form-control-dark flex-grow-1"
                                                placeholder="Search users by name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <button className="btn-primary-accent" type="submit">Search</button>
                                        </form>
                                        
                                        <div className="list-group list-group-flush">
                                            {users.length === 0 && <p className="text-muted-dark text-center py-3">No other users found.</p>}
                                            {users.map(u => (
                                                <div key={u.id} className="list-item-dark">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-circle me-3">
                                                            {u.username.substring(0,2).toUpperCase()}
                                                        </div>
                                                        <span className="fw-bold">{u.username}</span>
                                                    </div>
                                                    <div>
                                                        {u.status === 'none' && (
                                                            <button className="btn btn-sm btn-outline-accent" onClick={() => sendRequest(u.id)}>Add Friend</button>
                                                        )}
                                                        {u.status === 'request_sent' && <span className="badge bg-secondary me-2">Request Sent</span>}
                                                        {u.status === 'request_received' && <span className="badge bg-warning text-dark me-2">Respond in Requests</span>}
                                                        {u.status === 'friends' && <span className="badge bg-success me-2">Friends</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'pending' && (
                                    <div className="list-group list-group-flush">
                                        {pendingRequests.length === 0 && <p className="text-muted-dark text-center py-3">No pending requests.</p>}
                                        {pendingRequests.map(u => (
                                            <div key={u.id} className="list-item-dark">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-circle me-3">
                                                        {u.username.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <span className="fw-bold">{u.username}</span>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-primary-accent" onClick={() => respondRequest(u.id, 'accept')}>Accept</button>
                                                    <button className="btn btn-sm btn-outline-danger text-danger" onClick={() => respondRequest(u.id, 'reject')}>Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'friends' && (
                                    <div className="list-group list-group-flush">
                                        {myFriends.length === 0 && <p className="text-muted-dark text-center py-3">No friends yet. Go to the Find Friends tab!</p>}
                                        {myFriends.map(u => (
                                            <div key={u.id} className="list-item-dark">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-circle me-3">
                                                        {u.username.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <span className="fw-bold">{u.username}</span>
                                                </div>
                                                <button className="btn btn-sm btn-primary-accent" onClick={() => setActiveChat(u)}>Chat</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
