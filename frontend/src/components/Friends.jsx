import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import profileImage from '../assets/profile2.jpg';

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
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showWallpaperModal, setShowWallpaperModal] = useState(false);
    const [chatWallpaper, setChatWallpaper] = useState(localStorage.getItem('chatWallpaper') || 'https://m.media-amazon.com/images/I/71u+fC48JCL.jpg');

    useEffect(() => {
        if (!access) {
            navigate('/');
            return;
        }
        if (activeTab === 'find') fetchUsers(searchQuery);
        if (activeTab === 'pending') fetchPendingRequests();
        if (activeTab === 'friends') fetchMyFriends();
    }, [activeTab, access]);

    const fetchMessages = async (userId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/chat/${userId}`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) setMessages(await res.json());
        } catch (error) { console.error(error); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/chat/${activeChat.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({ content: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages(activeChat.id); // Refresh messages
            }
        } catch (error) { console.error(error); }
    };

    // Polling for messages
    useEffect(() => {
        let interval;
        if (activeChat) {
            fetchMessages(activeChat.id);
            interval = setInterval(() => {
                fetchMessages(activeChat.id);
            }, 3000); // Poll every 3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeChat, access]);

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `${import.meta.env.VITE_API_BASE_URL}/api/user/friends/search?q=${query}` : `${import.meta.env.VITE_API_BASE_URL}/api/user/friends/search`;
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
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/pending`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) setPendingRequests(await res.json());
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const fetchMyFriends = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/list`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) setMyFriends(await res.json());
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

    const updateWallpaper = (url) => {
        if (!url) return;
        setChatWallpaper(url);
        localStorage.setItem('chatWallpaper', url);
        setShowWallpaperModal(false);
        setShowSettings(false);
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

    if (activeChat) {
        return (
            <div style={{
                backgroundImage: `url("${chatWallpaper}")`,
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
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    padding: '30px',
                    borderRadius: '15px',
                    maxWidth: '600px',
                    width: '100%',
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div className="position-relative mb-4 text-center d-flex justify-content-between align-items-center">
                        <button 
                            type="button" 
                            className="btn btn-link p-0 text-dark" 
                            style={{ textDecoration: 'none', fontSize: '28px' }} 
                            onClick={() => setActiveChat(null)}
                            title="Go Back"
                        >
                            &#8592;
                        </button>
                        <h2 className="m-0 fw-bold text-black flex-grow-1">
                            Chat with <Link to={`/profile/${activeChat.username}`} style={{color: 'rgb(241, 137, 52)', textDecoration: 'none'}}>{activeChat.username}</Link>
                        </h2>
                        <div className="position-relative">
                            <button className="btn btn-dark rounded-circle" style={{width:'40px', height:'40px'}} onClick={() => setShowSettings(!showSettings)}>⚙️</button>
                            {showSettings && (
                                <div className="position-absolute bg-white border rounded shadow p-2" style={{ right: 0, top: '45px', zIndex: 10, width: '150px' }}>
                                    <button className="btn btn-sm btn-light w-100 mb-1" onClick={() => setShowWallpaperModal(true)}>Set Wallpaper</button>
                                    <button className="btn btn-sm btn-danger w-100" onClick={blockFriend}>Block Friend</button>
                                </div>
                            )}
                        </div>
                    </div>
                    {showWallpaperModal && (
                        <div className="position-absolute bg-white p-4 rounded shadow text-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, width: '90%', maxWidth: '400px' }}>
                            <h4 className="text-dark fw-bold mb-3">Choose Wallpaper</h4>
                            <div className="d-flex flex-column gap-2 mb-3">
                                <button className="btn btn-outline-dark" onClick={() => updateWallpaper('https://m.media-amazon.com/images/I/71u+fC48JCL.jpg')}>Default Friends</button>
                                <button className="btn btn-outline-dark" onClick={() => updateWallpaper('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop')}>Cats Theme</button>
                                <button className="btn btn-outline-dark" onClick={() => updateWallpaper('https://images.unsplash.com/photo-1529156069898-49953eb1b55f?q=80&w=1000&auto=format&fit=crop')}>BFF Theme</button>
                                <button className="btn btn-outline-dark" onClick={() => updateWallpaper('https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1000&auto=format&fit=crop')}>Zootopia Theme</button>
                            </div>
                            <input type="text" className="form-control mb-2" placeholder="Or Paste Image URL..." id="customWallpaperUrl" />
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-secondary" onClick={() => setShowWallpaperModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => updateWallpaper(document.getElementById('customWallpaperUrl').value)}>Set Custom</button>
                            </div>
                        </div>
                    )}

                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.length === 0 && <p className="text-center text-dark mt-5 fw-bold">No messages yet. Say hi!</p>}
                        {messages.map(m => {
                            const isMine = m.sender_username === localStorage.getItem('username');
                            return (
                                <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', backgroundColor: isMine ? '#0095f6' : '#e4e6eb', color: isMine ? 'white' : 'black', padding: '10px 15px', borderRadius: '20px', maxWidth: '70%' }}>
                                    {m.content}
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={sendMessage} className="d-flex">
                        <input 
                            type="text" 
                            className="form-control me-2 rounded-pill" 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            placeholder="Type a message..." 
                            style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                        />
                        <button type="submit" className="btn rounded-pill" style={{ backgroundColor: 'rgb(241, 137, 52)', color: 'white', fontWeight: 'bold' }}>Send</button>
                    </form>
                </div>
            </div>
        );
    }

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
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                padding: '30px',
                borderRadius: '15px',
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
                                            <div>
                                                {u.status === 'none' && (
                                                    <button className="btn btn-sm btn-primary me-2" onClick={() => sendRequest(u.id)}>Add Friend</button>
                                                )}
                                                {u.status === 'request_sent' && <span className="badge bg-secondary me-2">Request Sent</span>}
                                                {u.status === 'request_received' && <span className="badge bg-warning text-dark me-2">Respond in Requests</span>}
                                                {u.status === 'friends' && <span className="badge bg-success me-2">Friends</span>}
                                                <button className="btn btn-sm" style={{ backgroundColor: '#0095f6', color: 'white', fontWeight: 'bold' }} onClick={() => setActiveChat(u)}>Chat</button>
                                            </div>
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
                                {myFriends.length === 0 && <p className="text-dark fw-bold text-center mt-3 fs-5">Make friends! Go to the Find Friends tab.</p>}
                                {myFriends.map(u => (
                                    <li key={u.id} className="list-group-item bg-transparent border-dark text-dark fw-bold d-flex justify-content-between align-items-center">
                                        {u.username}
                                        <button className="btn btn-sm" style={{ backgroundColor: '#0095f6', color: 'white', fontWeight: 'bold' }} onClick={() => setActiveChat(u)}>Chat</button>
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
