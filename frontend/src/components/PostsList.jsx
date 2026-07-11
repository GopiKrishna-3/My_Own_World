import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from './Post';
import createPostImage from '../assets/createpost.jpg'; // Import background image

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/posts/get/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error('Failed to fetch posts.');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Delete
  const handleDelete = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    console.log(`Post with ID ${postId} deleted.`);
  };

  // Handle Follow
  const handleFollow = (authorId) => {
    console.log(`Followed user with ID ${authorId}.`);
  };

  // Handle Unfollow
  const handleUnfollow = (authorId) => {
    console.log(`Unfollowed user with ID ${authorId}.`);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${createPostImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: '80px 0 20px 0',
      }}
    >
      <div className="container" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.4)', 
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        padding: '20px', 
        borderRadius: '15px' 
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
          <h2 className="m-0 d-inline-block fw-bold text-dark">Feed</h2>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {posts.map((post) => (
              <Post
                key={post.id}
                postId={post.id}
                title={post.title}
                author={post.author}
                content={post.content}
                media_file={post.media_file}
                media_type={post.media_type}
                likes={post.like_count}
                dislikes={post.dislike_count}
                onDelete={handleDelete}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
            
            {posts.length === 0 && (
              <div className="text-center text-muted mt-5">
                <h5>No posts yet. Be the first to share something!</h5>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsList;
