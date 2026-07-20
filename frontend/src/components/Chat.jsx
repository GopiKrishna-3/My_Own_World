import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Chat = ({ activeChat, setActiveChat, access, blockFriend }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/chat/${userId}`, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
            }
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="premium-card d-flex flex-column" style={{ height: '70vh' }}>
            <div className="premium-card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <button 
                        type="button" 
                        className="btn btn-link p-0 text-muted-dark me-3" 
                        onClick={() => setActiveChat(null)}
                        title="Go Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div className="avatar-circle">
                        {activeChat.username.substring(0,2).toUpperCase()}
                    </div>
                    <h5 className="m-0 fw-bold">
                        <Link to={`/profile/${activeChat.username}`} className="text-decoration-none text-white">{activeChat.username}</Link>
                    </h5>
                </div>
                
                <div className="position-relative">
                    <button className="btn btn-link text-muted-dark p-0" onClick={() => setShowSettings(!showSettings)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                    {showSettings && (
                        <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm border-0 rounded-3" style={{ minWidth: '150px', zIndex: 1000, backgroundColor: 'var(--bg-tertiary)' }}>
                            <button className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={blockFriend}>
                                Block Friend
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column">
                {messages.length === 0 && <p className="text-center text-muted-dark mt-5">No messages yet. Say hi!</p>}
                {messages.map((m, index) => {
                    const isMine = m.sender_username === localStorage.getItem('username');
                    
                    return (
                        <div key={m.id} className="d-flex flex-column w-100">
                            <div className={isMine ? "chat-bubble-sent" : "chat-bubble-received"}>
                                {m.content}
                            </div>
                            <div className={`chat-timestamp ${isMine ? 'sent' : 'received'}`}>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-3">
                <form onSubmit={sendMessage} className="d-flex align-items-center gap-2">
                    <input 
                        type="text" 
                        className="form-control-dark flex-grow-1" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type a message..." 
                    />
                    <button type="submit" className="btn-primary-accent" disabled={!newMessage.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
