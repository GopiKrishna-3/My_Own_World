import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import addPostImage from '../assets/addpost.jpg'; // Import the background image

const AddPost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const apiUrl = 'http://127.0.0.1:8000/api/posts/'; // Backend URL for creating a post
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Post created successfully!');
        setTimeout(() => {
          navigate('/home'); // Redirect to home (post list)
        }, 1000);
      } else {
        setMessage(data.message || 'Error creating the post.');
      }
    } catch (error) {
      setMessage('Error creating the post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${addPostImage})`, // Background image applied here
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)', // Reduced transparency (opacity 95%)
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 1)',
          width: '100%',
          maxWidth: '600px',
        }}
      >
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
          <h2 className="m-0 d-inline-block">Create a New Post</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 text-start">
          <div className="mb-3">
            <label htmlFor="title" className="form-label fw-bold text-black">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label fw-bold text-black">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-control"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
        {message && <div className="mt-3 alert alert-info">{message}</div>}
      </div>
    </div>
  );
};

export default AddPost;
