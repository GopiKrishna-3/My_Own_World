import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Users, LogOut, Trash2, X, Check } from 'lucide-react';
import Post from './Post';

const PostsList = () => {
    const navigate = useNavigate();
    const access = localStorage.getItem('accessToken');
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(null);
    
    // Circles State
    const [circles, setCircles] = useState([]);
    const [selectedCircle, setSelectedCircle] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    
    // Create Circle Form State
    const [circleName, setCircleName] = useState('');
    const [circleDesc, setCircleDesc] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [createLoading, setCreateLoading] = useState(false);
    
    // Circle Settings State
    const [inviteFriendsList, setInviteFriendsList] = useState([]);
    const [settingsActionLoading, setSettingsActionLoading] = useState(false);
    const [settingsError, setSettingsError] = useState('');

    useEffect(() => {
        if (!access) {
            navigate('/');
            return;
        }
        fetchCircles();
    }, [access]);

    const fetchCircles = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/`, {
                headers: { 'Authorization': `Bearer ${access}` },
            });
            if (response.ok) {
                const data = await response.json();
                setCircles(data);
                
                // Select circle
                if (data.length > 0) {
                    const savedId = localStorage.getItem('selectedCircleId');
                    const match = data.find(c => c.id.toString() === savedId);
                    const defaultCircle = match || data[0];
                    setSelectedCircle(defaultCircle);
                    localStorage.setItem('selectedCircleId', defaultCircle.id.toString());
                    fetchCirclePosts(defaultCircle.id, true);
                } else {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error fetching circles:', error);
            setLoading(false);
        }
    };

    const fetchCirclePosts = async (circleId, isNewCircle = false, url = null) => {
        setLoading(true);
        if (isNewCircle) {
            setPosts([]);
            setNextPage(null);
        }
        
        const fetchUrl = url || `${import.meta.env.VITE_API_BASE_URL}/api/posts/get/?circle_id=${circleId}`;
        try {
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${access}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.results) {
                    setPosts(prev => {
                        if (isNewCircle) return data.results;
                        const newPosts = data.results.filter(p => !prev.some(existing => existing.id === p.id));
                        return [...prev, ...newPosts];
                    });
                    setNextPage(data.next);
                } else {
                    setPosts(data);
                }
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
        setLoading(false);
    };

    const handleSelectCircle = (circle) => {
        setSelectedCircle(circle);
        localStorage.setItem('selectedCircleId', circle.id.toString());
        fetchCirclePosts(circle.id, true);
    };

    const handleDelete = (postId) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    };

    // Create Circle Logic
    const openCreateModal = () => {
        setShowCreateModal(true);
        fetchFriends();
    };

    const fetchFriends = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/list`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFriends(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const handleToggleFriend = (friendId) => {
        setSelectedFriends(prev => 
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleCreateCircle = async (e) => {
        e.preventDefault();
        if (!circleName.trim()) return;
        setCreateLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({
                    name: circleName,
                    description: circleDesc,
                    members: selectedFriends
                })
            });

            if (response.ok) {
                const newCircle = await response.json();
                setCircleName('');
                setCircleDesc('');
                setSelectedFriends([]);
                setShowCreateModal(false);
                
                // Add to circles list and select it
                setCircles(prev => [newCircle, ...prev]);
                setSelectedCircle(newCircle);
                localStorage.setItem('selectedCircleId', newCircle.id.toString());
                fetchCirclePosts(newCircle.id, true);
            }
        } catch (error) {
            console.error('Error creating circle:', error);
        } finally {
            setCreateLoading(false);
        }
    };

    // Circle Settings Logic
    const openSettingsModal = () => {
        setShowSettingsModal(true);
        setSettingsError('');
        fetchInviteableFriends();
    };

    const fetchInviteableFriends = async () => {
        if (!selectedCircle) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/list`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) {
                const data = await res.json();
                const allFriends = data.results || data;
                // Filter out already members
                const memberIds = selectedCircle.members.map(m => m.id);
                const inviteables = allFriends.filter(f => !memberIds.includes(f.id));
                setInviteFriendsList(inviteables);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleInviteFriend = async (friendId) => {
        setSettingsActionLoading(true);
        setSettingsError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/${selectedCircle.id}/invite/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({ user_id: friendId })
            });

            if (res.ok) {
                // Reload circle details to update members list
                await refreshSelectedCircleDetails();
            } else {
                const errData = await res.json();
                setSettingsError(errData.error || 'Failed to invite friend.');
            }
        } catch (error) {
            setSettingsError('Connection error.');
        } finally {
            setSettingsActionLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        setSettingsActionLoading(true);
        setSettingsError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/${selectedCircle.id}/remove-member/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({ user_id: memberId })
            });

            if (res.ok) {
                await refreshSelectedCircleDetails();
            } else {
                const errData = await res.json();
                setSettingsError(errData.error || 'Failed to remove member.');
            }
        } catch (error) {
            setSettingsError('Connection error.');
        } finally {
            setSettingsActionLoading(false);
        }
    };

    const handleLeaveCircle = async () => {
        if (!window.confirm('Are you sure you want to leave this circle?')) return;
        setSettingsActionLoading(true);
        setSettingsError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/${selectedCircle.id}/leave/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${access}` }
            });

            if (res.ok) {
                setShowSettingsModal(false);
                fetchCircles(); // Reload all circles
            } else {
                const errData = await res.json();
                setSettingsError(errData.error || 'Failed to leave circle.');
            }
        } catch (error) {
            setSettingsError('Connection error.');
        } finally {
            setSettingsActionLoading(false);
        }
    };

    const refreshSelectedCircleDetails = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/`, {
                headers: { 'Authorization': `Bearer ${access}` },
            });
            if (response.ok) {
                const data = await response.json();
                setCircles(data);
                const updatedCircle = data.find(c => c.id === selectedCircle.id);
                if (updatedCircle) {
                    setSelectedCircle(updatedCircle);
                    // Refresh inviteable list
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/list`, {
                        headers: { 'Authorization': `Bearer ${access}` }
                    });
                    if (res.ok) {
                        const dataF = await res.json();
                        const allFriends = dataF.results || dataF;
                        const memberIds = updatedCircle.members.map(m => m.id);
                        setInviteFriendsList(allFriends.filter(f => !memberIds.includes(f.id)));
                    }
                }
            }
        } catch (error) {
            console.error('Error refreshing circle:', error);
        }
    };

    const currentUsername = localStorage.getItem('username');

    return (
        <div className="page-container" style={{ paddingTop: '100px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                
                {/* Horizontal Circle Switcher Tabs */}
                <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', scrollbarWidth: 'none' }}>
                    {circles.map(c => (
                        <button
                            key={c.id}
                            className={`btn btn-sm px-3 py-2 rounded-pill border-0 transition-all ${selectedCircle?.id === c.id ? 'btn-primary-accent text-white' : 'text-light'}`}
                            style={{ 
                                whiteSpace: 'nowrap', 
                                backgroundColor: selectedCircle?.id === c.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                            onClick={() => handleSelectCircle(c)}
                        >
                            {c.name}
                        </button>
                    ))}
                    <button 
                        className="btn btn-sm px-3 py-2 rounded-pill border-0 d-flex align-items-center gap-1"
                        style={{ 
                            whiteSpace: 'nowrap', 
                            fontSize: '13px',
                            color: 'var(--accent-primary)',
                            backgroundColor: 'rgba(127, 90, 240, 0.08)',
                            fontWeight: '600'
                        }}
                        onClick={openCreateModal}
                    >
                        <Plus size={14} /> New Circle
                    </button>
                </div>

                <div className="premium-card mb-4">
                    {/* Circle Title & Settings Button */}
                    <div className="d-flex justify-content-between align-items-start mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div>
                            <h4 className="fw-bold m-0">{selectedCircle?.name || 'Feed'}</h4>
                            {selectedCircle?.description && (
                                <p className="text-muted-dark small m-0 mt-1" style={{ fontSize: '13px' }}>
                                    {selectedCircle.description}
                                </p>
                            )}
                        </div>
                        {selectedCircle && (
                            <button 
                                className="btn btn-link p-0 text-muted-dark hover-light d-flex align-items-center gap-1 text-decoration-none"
                                style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                                onClick={openSettingsModal}
                            >
                                <Settings size={16} style={{ color: 'var(--accent-primary)' }} /> Settings
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-2">
                        {posts.map((post) => (
                            <div className="mb-4" key={post.id}>
                                <Post
                                    postId={post.id}
                                    title={post.title}
                                    author={post.author}
                                    author_id={post.author_id}
                                    friend_status={post.friend_status}
                                    content={post.content}
                                    media_file={post.media_file}
                                    media_type={post.media_type}
                                    likes={post.like_count}
                                    dislikes={post.dislike_count}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="text-center my-4">
                                <div className="spinner-border text-accent" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                        
                        {!loading && posts.length === 0 && selectedCircle && (
                            <div className="text-center text-muted-dark mt-4 py-5">
                                <h5>No posts yet. Be the first to share something with {selectedCircle.name}!</h5>
                                <button className="btn btn-primary-accent mt-3" onClick={() => navigate('/create-post')}>Create Post</button>
                            </div>
                        )}

                        {!loading && circles.length === 0 && (
                            <div className="text-center text-muted-dark mt-4 py-5">
                                <h5>You are not in any circles yet. Please create one to start posting!</h5>
                                <button className="btn btn-primary-accent mt-3" onClick={openCreateModal}>Create a Circle</button>
                            </div>
                        )}
                        
                        {nextPage && !loading && (
                            <div className="text-center mt-4">
                                <button className="btn btn-outline-accent" onClick={() => fetchCirclePosts(selectedCircle.id, false, nextPage)}>
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CREATE CIRCLE MODAL */}
            {showCreateModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1040 }}></div>
                    <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
                            <div className="premium-card text-start w-100 position-relative border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setShowCreateModal(false)}></button>
                                
                                <h4 className="fw-bold mb-4">Create New Circle</h4>
                                <form onSubmit={handleCreateCircle}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted-dark fw-bold">Circle Name</label>
                                        <input
                                            type="text"
                                            className="form-control-dark w-100"
                                            value={circleName}
                                            onChange={(e) => setCircleName(e.target.value)}
                                            placeholder="e.g. Close Friends, Family"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted-dark fw-bold">Description (Optional)</label>
                                        <textarea
                                            className="form-control-dark w-100"
                                            rows="2"
                                            value={circleDesc}
                                            onChange={(e) => setCircleDesc(e.target.value)}
                                            placeholder="What is this circle for?"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label text-muted-dark fw-bold mb-2">Invite Friends</label>
                                        <div className="overflow-auto pe-2" style={{ maxHeight: '180px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', backgroundColor: 'var(--bg-tertiary)' }}>
                                            {friends.length === 0 ? (
                                                <div className="text-muted-dark small py-2 text-center">No friends available to invite.</div>
                                            ) : (
                                                friends.map(friend => (
                                                    <div key={friend.id} className="d-flex align-items-center justify-content-between py-1 mb-1">
                                                        <span className="small">{friend.username}</span>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            style={{ cursor: 'pointer' }}
                                                            checked={selectedFriends.includes(friend.id)}
                                                            onChange={() => handleToggleFriend(friend.id)}
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary-accent w-100 py-2" disabled={createLoading}>
                                        {createLoading ? 'Creating...' : 'Create Circle'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* CIRCLE SETTINGS MODAL */}
            {showSettingsModal && selectedCircle && (
                <>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1040 }}></div>
                    <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '550px' }}>
                            <div className="premium-card text-start w-100 position-relative border-0 shadow-lg" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
                                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setShowSettingsModal(false)}></button>
                                
                                <div className="pe-3" style={{ overflowY: 'auto' }}>
                                    <h4 className="fw-bold mb-2">Circle Settings</h4>
                                    <h6 className="text-muted-dark mb-4">{selectedCircle.name}</h6>

                                    {settingsError && <div className="alert alert-danger py-2 small mb-3">{settingsError}</div>}

                                    {/* Members List */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-1 mb-2">
                                            <Users size={16} className="text-accent" />
                                            <span className="fw-bold text-muted-dark small">Members ({selectedCircle.members.length})</span>
                                        </div>
                                        
                                        <div className="p-2 rounded-3" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            {selectedCircle.members.map(member => {
                                                const isCreator = member.id === selectedCircle.created_by;
                                                const amICreator = selectedCircle.created_by_username === currentUsername;
                                                return (
                                                    <div key={member.id} className="d-flex justify-content-between align-items-center py-2 px-2 border-bottom border-translucent">
                                                        <div>
                                                            <span className="small fw-semibold">{member.username}</span>
                                                            {isCreator && <span className="badge bg-secondary ms-2" style={{ fontSize: '10px' }}>Creator</span>}
                                                        </div>
                                                        
                                                        {/* Remove option for creators */}
                                                        {amICreator && !isCreator && (
                                                            <button 
                                                                className="btn btn-link p-0 text-danger" 
                                                                title="Remove Member"
                                                                disabled={settingsActionLoading}
                                                                onClick={() => handleRemoveMember(member.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Invite Friends Section */}
                                    <div className="mb-4">
                                        <span className="fw-bold text-muted-dark small mb-2 d-block">Invite Friends</span>
                                        <div className="p-2 rounded-3 overflow-auto" style={{ maxHeight: '150px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            {inviteFriendsList.length === 0 ? (
                                                <div className="text-muted-dark small text-center py-2">No other friends available to invite.</div>
                                            ) : (
                                                inviteFriendsList.map(friend => (
                                                    <div key={friend.id} className="d-flex justify-content-between align-items-center py-2 px-2 border-bottom border-translucent">
                                                        <span className="small">{friend.username}</span>
                                                        <button 
                                                            className="btn btn-sm btn-outline-accent py-0 px-2"
                                                            style={{ fontSize: '11px' }}
                                                            disabled={settingsActionLoading}
                                                            onClick={() => handleInviteFriend(friend.id)}
                                                        >
                                                            Invite
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Leave Circle Button */}
                                    <div className="pt-3 border-top border-translucent text-center">
                                        <button 
                                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 mx-auto"
                                            disabled={settingsActionLoading}
                                            onClick={handleLeaveCircle}
                                        >
                                            <LogOut size={14} /> Leave Circle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PostsList;
