import React, { useState, useEffect } from 'react';
import { Heart, ThumbsDown, MessageCircle, Bookmark, MoreHorizontal, Edit2, Trash2, UserPlus, UserMinus, Send } from 'lucide-react';

const Post = ({ postId, title, author, content, media_file, media_type, likes: initialLikes, dislikes: initialDislikes, onDelete, onFollow, onUnfollow }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Just UI for now
  const [isFollowing, setIsFollowing] = useState(false);
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
      const response = await fetch(`http://127.0.0.1:8000/api/post/${postId}/like/`, {
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
      const response = await fetch(`http://127.0.0.1:8000/api/post/${postId}/dislike/`, {
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
    const editUrl = `http://127.0.0.1:8000/api/post/${postId}/edit/`;

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
    const deleteUrl = `http://127.0.0.1:8000/api/post/${postId}/delete/`;

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

  // Handle Follow
  const handleFollow = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const followUrl = `http://127.0.0.1:8000/api/user/${author}/follow/`;

    try {
      const response = await fetch(followUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsFollowing(true);
        setMessage('User followed successfully!');
        onFollow(author);
      } else {
        setMessage('Error following the user.');
      }
    } catch (error) {
      setMessage('Error following the user.');
    }
  };

  // Handle Unfollow
  const handleUnfollow = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const unfollowUrl = `http://127.0.0.1:8000/api/user/${author}/unfollow/`;

    try {
      const response = await fetch(unfollowUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setIsFollowing(false);
        setMessage('User unfollowed successfully!');
        onUnfollow(author);
      } else {
        setMessage('Error unfollowing the user.');
      }
    } catch (error) {
      setMessage('Error unfollowing the user.');
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/post/${postId}/comments/`, {
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
      const response = await fetch(`http://127.0.0.1:8000/api/post/${postId}/comments/add/`, {
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
    <div className="card mb-4 border-0 shadow-sm rounded-4" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {/* Header */}
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold me-3" 
            style={{ width: '40px', height: '40px', backgroundColor: '#e1306c', fontSize: '18px' }}
          >
            {getInitials(author)}
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{author}</h6>
          </div>
        </div>
        
        <div className="d-flex align-items-center position-relative">
          {loggedInUser !== author && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className={`btn btn-sm me-2 rounded-pill px-3 fw-bold ${isFollowing ? 'btn-light border' : 'btn-primary'}`}
              style={!isFollowing ? { backgroundColor: '#0095f6', borderColor: '#0095f6' } : {}}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {loggedInUser === author && (
            <div className="dropdown">
              <button 
                className="btn btn-link text-dark p-0 text-decoration-none" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreHorizontal size={24} color="#262626" />
              </button>
              {showDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm border-0 rounded-3" style={{ minWidth: '150px', zIndex: 1000, backgroundColor: '#fff', border: '1px solid #dbdbdb' }}>
                  <button className="dropdown-item d-flex align-items-center py-2" onClick={() => { setEditMode(true); setShowDropdown(false); }}>
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
      <div className="card-body px-4 py-2">
        {editMode ? (
          <div className="mb-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-control mb-2 rounded-3"
              placeholder="Post Title"
            />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="form-control mb-2 rounded-3"
              rows="4"
              placeholder="What's on your mind?"
            />
            <div className="d-flex gap-2">
              <button className="btn btn-primary rounded-pill px-4 btn-sm" onClick={handleEdit}>
                Save Changes
              </button>
              <button className="btn btn-light rounded-pill px-4 border btn-sm" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {title && <h5 className="card-title fw-bold mb-2">{title}</h5>}
            <p className="card-text text-dark fs-6" style={{ whiteSpace: 'pre-line', margin: 0 }}>{content}</p>
            {media_file && (
              <div className="mt-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
                {media_type === 'image' ? (
                  <img src={media_file.startsWith('http') ? media_file : `http://127.0.0.1:8000${media_file}`} alt="Post Media" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                ) : media_type === 'video' ? (
                  <video controls style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}>
                    <source src={media_file.startsWith('http') ? media_file : `http://127.0.0.1:8000${media_file}`} />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions / Footer */}
      <div className="card-footer bg-white border-0 px-3 pb-3 pt-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex gap-3 align-items-center">
            <button 
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center"
              style={{ color: isLiked ? '#ed4956' : '#262626' }}
              onClick={handleLike}
            >
              <Heart size={26} fill={isLiked ? '#ed4956' : 'none'} color={isLiked ? '#ed4956' : '#262626'} />
            </button>

            <button 
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center"
              style={{ color: isDisliked ? '#262626' : '#262626' }}
              onClick={handleDislike}
            >
              <ThumbsDown size={26} fill={isDisliked ? '#262626' : 'none'} color="#262626" />
            </button>

            <button 
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center"
              style={{ color: '#262626' }}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={26} color="#262626" />
            </button>
          </div>

          <button 
            className="btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center"
            style={{ color: '#262626' }}
            onClick={toggleSave}
          >
            <Bookmark size={26} fill={isSaved ? '#262626' : 'none'} color="#262626" />
          </button>
        </div>

        {/* Likes / Dislikes Count */}
        <div className="fw-bold mb-2 mt-1" style={{ fontSize: '14px', color: '#262626' }}>
          {likes} {likes === 1 ? 'like' : 'likes'} 
          {dislikes > 0 && <span className="ms-2 text-muted fw-normal">• {dislikes} dislikes</span>}
        </div>

        {message && <small className="text-success d-block mb-2">{message}</small>}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-2 border-top pt-3">
            {comments.length > 0 ? (
              <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {comments.map((comment) => (
                  <div key={comment.id} className="mb-2 lh-sm">
                    <span className="fw-bold me-2" style={{ fontSize: '14px', color: '#262626' }}>{comment.author || 'User'}</span>
                    <span style={{ fontSize: '14px', color: '#262626' }}>{comment.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-3">No comments yet. Be the first to comment!</p>
            )}

            <form onSubmit={handleAddComment} className="d-flex align-items-center position-relative mt-2">
              <input
                type="text"
                className="form-control rounded-pill pe-5 bg-light border-0"
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                style={{ fontSize: '14px', padding: '10px 15px', boxShadow: 'none' }}
              />
              <button 
                type="submit" 
                className="btn btn-link position-absolute end-0 text-decoration-none fw-bold"
                style={{ color: commentContent.trim() ? '#0095f6' : '#a8c7fa', padding: '0 15px' }}
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

