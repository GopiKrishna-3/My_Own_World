import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import addPostImage from '../assets/addpost.jpg';

const AddPost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileError('');
    const fileType = file.type;

    if (fileType.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 300) {
                setFileError('Video must be 5 minutes or less.');
                setMediaFile(null);
                setMediaType('');
                e.target.value = null; // Clear input
            } else {
                setMediaFile(file);
                setMediaType('video');
            }
        };
        video.src = URL.createObjectURL(file);
    } else if (fileType.startsWith('image/')) {
        setMediaFile(file);
        setMediaType('image');
    } else {
        setFileError('Unsupported file format. Please select an image or a video.');
        setMediaFile(null);
        setMediaType('');
        e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;

    setLoading(true);
    setMessage('');

    const apiUrl = 'http://127.0.0.1:8000/api/posts/';
    const accessToken = localStorage.getItem('accessToken');

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    if (mediaFile) {
        submitData.append('media_file', mediaFile);
        submitData.append('media_type', mediaType);
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: submitData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Post created successfully!');
        setTimeout(() => {
          navigate('/posts'); // Redirect to posts list
        }, 1000);
      } else {
        setMessage(data.detail || data.message || 'Error creating the post.');
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
        backgroundImage: `url(${addPostImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '100px 20px 20px 20px', // Adjusted top padding for navbar
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
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
          <h2 className="m-0 d-inline-block fw-bold text-dark">Create a New Post</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-2 text-start">
          <div className="mb-3">
            <label htmlFor="title" className="form-label fw-bold text-dark">Title</label>
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
            <label htmlFor="content" className="form-label fw-bold text-dark">Content</label>
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
          <div className="mb-3">
            <label htmlFor="media_file" className="form-label fw-bold text-dark">Upload Photo/Video (Max 5 mins)</label>
            <input
              type="file"
              id="media_file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="form-control"
            />
            {fileError && <div className="text-danger mt-1 small">{fileError}</div>}
          </div>
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary px-5 py-2 fw-bold" disabled={loading || !!fileError}>
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
