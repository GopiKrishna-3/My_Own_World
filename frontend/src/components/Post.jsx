import React, { useState, useEffect } from 'react';
import { Heart, ThumbsDown, MessageCircle, Bookmark, MoreHorizontal, Edit2, Trash2, UserPlus, UserMinus, Send } from 'lucide-react';

const Post = ({ postId, title, author, author_id, friend_status: initialFriendStatus, content, media_file, media_type, likes: initialLikes, dislikes: initialDislikes, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Just UI for now
  const [friendStatus, setFriendStatus] = useState(initialFriendStatus || 'none');
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ title, content });
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const loggedInUser = localStorage.getItem('username');

  // Handle Like
  const handleLike = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/post/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (isLiked) {
          setLikes((prev) => prev - 1); // Unlike
          setIsLiked(false);
        } else {
          setLikes((prev) => prev + 1); // Like
          if (isDisliked) {
            setDislikes((prev) => prev - 1); // Remove dislike if it was disliked
          }
          setIsLiked(true);
          setIsDisliked(false);
        }
        setMessage(data.message || 'Successfully liked the post.');
      } else {
        setMessage('Error liking the post.');
      }
    } catch (error) {
      setMessage('Error liking the post.');
    }
  };

  // Handle Dislike
  const handleDislike = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/post/${postId}/dislike/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (isDisliked) {
          setDislikes((prev) => prev - 1); // Undislike
          setIsDisliked(false);
        } else {
          setDislikes((prev) => prev + 1); // Dislike
          if (isLiked) {
            setLikes((prev) => prev - 1); // Remove like if it was liked
          }
          setIsDisliked(true);
          setIsLiked(false);
        }
        setMessage(data.message || 'Successfully disliked the post.');
      } else {
        setMessage('Error disliking the post.');
      }
    } catch (error) {
      setMessage('Error disliking the post.');
    }
  };

  // Handle Edit
  const handleEdit = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const editUrl = `${import.meta.env.VITE_API_BASE_URL}/api/post/${postId}/edit/`;

    try {
      const response = await fetch(editUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Post updated successfully!');
        setEditMode(false);
        setShowDropdown(false);
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to update the post.');
      }
    } catch (error) {
      setMessage('Error updating the post.');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const deleteUrl = `${import.meta.env.VITE_API_BASE_URL}/api/post/${postId}/delete/`;

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setMessage('Post deleted successfully!');
        onDelete(postId);
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to delete the post.');
      }
    } catch (error) {
      setMessage('Error deleting the post.');
    }
  };

  // Handle Add Friend
  const handleAddFriend = async () => {
    if (friendStatus === 'request_sent' || friendStatus === 'friends') return;
    
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/friends/request/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to_user_id: author_id })
      });

      if (response.ok) {
        setFriendStatus('request_sent');
        setMessage('Friend request sent!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Error sending friend request.');
      }
    } catch (error) {
      setMessage('Error sending friend request.');
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/post/${postId}/comments/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setLoading(true);
    setMessage('');

    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/post/${postId}/comments/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prevComments) => [newComment, ...prevComments]);
        setCommentContent('');
      } else {
        setMessage('Failed to add comment. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while adding the comment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const toggleSave = () => setIsSaved(!isSaved);

  // Utility to generate initials for avatar
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="premium-card mb-4">
      {/* Header */}
      <div className="premium-card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="avatar-circle">
            {getInitials(author)}
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{author}</h6>
          </div>
        </div>
        
        <div className="d-flex align-items-center position-relative">
          {loggedInUser !== author && friendStatus !== 'self' && (
            <button
              onClick={friendStatus === 'none' ? handleAddFriend : undefined}
              disabled={friendStatus !== 'none'}
              className={`btn btn-sm me-2 ${friendStatus === 'none' ? 'btn-primary-accent' : 'btn-outline-accent'}`}
            >
              {friendStatus === 'none' && 'Add Friend'}
              {friendStatus === 'request_sent' && 'Request Sent'}
              {friendStatus === 'request_received' && 'Request Received'}
              {friendStatus === 'friends' && 'Friends'}
            </button>
          )}

          {loggedInUser === author && (
            <div className="dropdown">
              <button 
                className="btn btn-link p-0 text-decoration-none" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreHorizontal size={24} className="text-muted-dark" />
              </button>
              {showDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm border-0 rounded-3" style={{ minWidth: '150px', zIndex: 1000, backgroundColor: 'var(--bg-tertiary)' }}>
                  <button className="dropdown-item d-flex align-items-center py-2 text-primary" onClick={() => { setEditMode(true); setShowDropdown(false); }}>
                    <Edit2 size={16} className="me-2" /> Edit Post
                  </button>
                  <button className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={handleDelete}>
                    <Trash2 size={16} className="me-2" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="px-2 py-2">
        {editMode ? (
          <div className="mb-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-control-dark mb-2 w-100"
              placeholder="Post Title"
            />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="form-control-dark mb-2 w-100"
              rows="4"
              placeholder="What's on your mind?"
            />
            <div className="d-flex gap-2">
              <button className="btn-primary-accent btn-sm" onClick={handleEdit}>
                Save Changes
              </button>
              <button className="btn-outline-accent btn-sm" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {title && <h5 className="card-title fw-bold mb-2">{title}</h5>}
            <p className="card-text fs-6" style={{ whiteSpace: 'pre-line', margin: 0 }}>{content}</p>
            {media_file && (
              <div className="mt-3 text-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden' }}>
                {media_type === 'image' ? (
                  <img src={media_file.startsWith('http') ? media_file : `${import.meta.env.VITE_API_BASE_URL}${media_file}`} alt="Post Media" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                ) : media_type === 'video' ? (
                  <video controls style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}>
                    <source src={media_file.startsWith('http') ? media_file : `${import.meta.env.VITE_API_BASE_URL}${media_file}`} />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions / Footer */}
      <div className="border-0 px-2 pb-3 pt-2">
        <div className="d-flex justify-content-between align-items-center mb-2 mt-3 border-top pt-3" style={{borderColor: 'rgba(255,255,255,0.05)'}}>
          <div className="d-flex gap-3 align-items-center">
            <button 
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center"
              style={{ color: isLiked ? 'var(--danger)' : 'var(--text-secondary)' }}
              onClick={handleLike}
            >
              <Heart size={26} fill={isLiked ? 'var(--danger)' : 'none'} color={isLiked ? 'var(--danger)' : 'var(--text-secondary)'} />
            </button>

            <button 
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center"
              style={{ color: isDisliked ? 'var(--warning)' : 'var(--text-secondary)' }}
              onClick={handleDislike}
            >
              <ThumbsDown size={26} fill={isDisliked ? 'var(--warning)' : 'none'} color={isDisliked ? 'var(--warning)' : 'var(--text-secondary)'} />
            </button>

            <button 
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center text-muted-dark"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={26} />
            </button>
          </div>

          <button 
            className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center text-muted-dark"
            onClick={toggleSave}
          >
            <Bookmark size={26} fill={isSaved ? 'var(--text-secondary)' : 'none'} />
          </button>
        </div>

        {/* Likes / Dislikes Count */}
        <div className="fw-bold mb-2 mt-1" style={{ fontSize: '14px' }}>
          {likes} {likes === 1 ? 'like' : 'likes'} 
          {dislikes > 0 && <span className="ms-2 text-muted-dark fw-normal">• {dislikes} dislikes</span>}
        </div>

        {message && (
          <small className={`d-block mb-2 ${message.toLowerCase().includes('error') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('already exists') ? 'text-danger' : 'text-success'}`}>
            {message}
          </small>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-2 border-top pt-3" style={{borderColor: 'rgba(255,255,255,0.05)'}}>
            {comments.length > 0 ? (
              <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {comments.map((comment) => (
                  <div key={comment.id} className="mb-2 lh-sm">
                    <span className="fw-bold me-2" style={{ fontSize: '14px' }}>{comment.author || 'User'}</span>
                    <span style={{ fontSize: '14px' }}>{comment.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-dark small mb-3">No comments yet. Be the first to comment!</p>
            )}

            <form onSubmit={handleAddComment} className="d-flex align-items-center position-relative mt-2">
              <input
                type="text"
                className="form-control-dark pe-5 w-100"
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-link position-absolute end-0 text-decoration-none fw-bold"
                style={{ color: commentContent.trim() ? 'var(--accent-primary)' : 'var(--text-secondary)', padding: '0 15px' }}
                disabled={loading || !commentContent.trim()}
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;

