import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Check } from 'lucide-react';

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
  
  // Circles State
  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState('');
  const [circlesLoading, setCirclesLoading] = useState(true);

  // AI Assist State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiMode, setAiMode] = useState('');
  const [aiError, setAiError] = useState('');
  const [showAiDropdown, setShowAiDropdown] = useState(false);

  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!accessToken) {
        navigate('/');
        return;
    }
    fetchCircles();
  }, [accessToken]);

  const fetchCircles = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/circles/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (response.ok) {
            const data = await response.json();
            setCircles(data);
            if (data.length > 0) {
                // Pre-select last used circle or first circle
                const savedId = localStorage.getItem('selectedCircleId');
                const match = data.find(c => c.id.toString() === savedId);
                setSelectedCircleId(match ? match.id.toString() : data[0].id.toString());
            }
        }
    } catch (error) {
        console.error('Error fetching circles:', error);
    } finally {
        setCirclesLoading(false);
    }
  };

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

  const handleAiAssist = async (mode) => {
    setShowAiDropdown(false);
    setAiError('');
    setAiSuggestions([]);
    
    if (mode !== 'Suggest a title' && !formData.content.trim()) {
        setAiError('Please enter some content first.');
        return;
    }
    
    setAiLoading(true);
    setAiMode(mode);
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts/ai-assist/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: formData.content,
                title: formData.title,
                mode: mode
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            setAiSuggestions(data.suggestions || []);
        } else {
            setAiError(data.error || data.detail || 'Failed to get AI suggestions.');
        }
    } catch (error) {
        setAiError('Error connecting to AI assistant.');
    } finally {
        setAiLoading(false);
    }
  };
  
  const applySuggestion = (text) => {
      if (aiMode === 'Suggest a title') {
          setFormData(prev => ({ ...prev, title: text }));
      } else {
          setFormData(prev => ({ ...prev, content: text }));
      }
      setAiSuggestions([]);
      setAiMode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;
    if (!selectedCircleId) {
        setMessage('You must select a circle to post to.');
        return;
    }

    setLoading(true);
    setMessage('');

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/posts/`;

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('circle_ids', selectedCircleId); // Tie post to circle

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
        // Remember circle ID for subsequent posts
        localStorage.setItem('selectedCircleId', selectedCircleId);
        setTimeout(() => {
          navigate('/home');
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

  if (circlesLoading) {
      return (
          <div className="page-container d-flex justify-content-center align-items-center">
              <div className="spinner-border text-accent" role="status">
                  <span className="visually-hidden">Loading circles...</span>
              </div>
          </div>
      );
  }

  if (circles.length === 0) {
      return (
          <div className="page-container">
              <div className="container" style={{ maxWidth: '600px' }}>
                  <div className="premium-card text-center py-5">
                      <h4 className="fw-bold mb-3">No Circles Found</h4>
                      <p className="text-muted-dark mb-4">
                          You must belong to at least one Circle before you can create a post. Every post is shared within a specific group chat/circle.
                      </p>
                      <button className="btn btn-primary-accent px-4 py-2" onClick={() => navigate('/home')}>
                          Go to Dashboard to Join or Create a Circle
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="premium-card">
          <div className="position-relative mb-4 text-center">
            <button 
              type="button" 
              className="btn btn-link p-0 text-muted-dark position-absolute start-0 top-50 translate-middle-y" 
              style={{ textDecoration: 'none' }} 
              onClick={() => navigate(-1)}
              title="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h4 className="m-0 fw-bold">Create a New Post</h4>
          </div>

          <form onSubmit={handleSubmit} className="text-start">
            
            {/* Circle Selection Dropdown */}
            <div className="mb-3">
              <label htmlFor="circle" className="form-label text-muted-dark fw-bold">Select Circle</label>
              <select
                id="circle"
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="form-control-dark w-100"
                required
              >
                {circles.map(c => (
                    <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        {c.name}
                    </option>
                ))}
              </select>
            </div>

            <div className="mb-3 position-relative">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="title" className="form-label text-muted-dark fw-bold mb-0">Title</label>
                <button 
                    type="button" 
                    className="btn btn-link p-0 text-decoration-none d-flex align-items-center" 
                    style={{ fontSize: '12px', color: 'var(--accent-primary)' }}
                    onClick={() => handleAiAssist('Suggest a title')}
                    disabled={aiLoading}
                >
                    <Sparkles size={14} className="me-1" /> Suggest Title
                </button>
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control-dark w-100"
                placeholder="Give your post a catchy title"
                required
              />
            </div>

            <div className="mb-3 position-relative">
              <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="content" className="form-label text-muted-dark fw-bold mb-0">Content</label>
                  <div className="dropdown">
                      <button 
                          type="button" 
                          className="btn btn-link p-0 text-decoration-none d-flex align-items-center" 
                          style={{ fontSize: '13px', color: 'var(--accent-primary)' }}
                          onClick={() => setShowAiDropdown(!showAiDropdown)}
                          disabled={aiLoading}
                      >
                          {aiLoading && aiMode !== 'Suggest a title' ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          ) : (
                              <Sparkles size={14} className="me-1" />
                          )}
                          {aiLoading && aiMode !== 'Suggest a title' ? 'Thinking...' : 'Improve with AI'}
                      </button>
                      
                      {showAiDropdown && (
                          <div className="dropdown-menu show position-absolute end-0 mt-1 shadow-sm border-0 rounded-3 p-1" style={{ minWidth: '180px', zIndex: 1000, backgroundColor: 'var(--bg-tertiary)' }}>
                              <button type="button" className="dropdown-item py-2 text-light" onClick={() => handleAiAssist('Improve writing')}>Improve writing</button>
                              <button type="button" className="dropdown-item py-2 text-light" onClick={() => handleAiAssist('Make it shorter')}>Make it shorter</button>
                              <button type="button" className="dropdown-item py-2 text-light" onClick={() => handleAiAssist('Expand')}>Expand</button>
                          </div>
                      )}
                  </div>
              </div>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="form-control-dark w-100"
                rows="5"
                placeholder="What's on your mind?"
                required
              ></textarea>
              
              {aiError && <div className="text-danger mt-2 small fw-bold">{aiError}</div>}
              
              {aiSuggestions.length > 0 && (
                  <div className="mt-3 p-3 rounded-3 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--accent-primary) !important' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold" style={{ color: 'var(--accent-primary)', fontSize: '14px' }}>
                              <Sparkles size={14} className="me-1" /> AI Suggestions ({aiMode})
                          </span>
                          <button type="button" className="btn btn-link p-0 text-muted-dark" onClick={() => { setAiSuggestions([]); setAiMode(''); }}>
                              <X size={16} />
                          </button>
                      </div>
                      
                      <div className="d-flex flex-column gap-2">
                          {aiSuggestions.map((suggestion, index) => (
                              <div key={index} className="p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <p className="mb-2" style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{suggestion}</p>
                                  <button 
                                      type="button" 
                                      className="btn btn-sm btn-outline-accent py-1 px-2 d-flex align-items-center" 
                                      style={{ fontSize: '12px' }}
                                      onClick={() => applySuggestion(suggestion)}
                                  >
                                      <Check size={12} className="me-1" /> Use this
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="media_file" className="form-label text-muted-dark fw-bold">Upload Photo/Video (Max 5 mins)</label>
              <input
                type="file"
                id="media_file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="form-control-dark w-100"
                style={{ padding: '8px' }}
              />
              {fileError && <div className="text-danger mt-2 small fw-bold">{fileError}</div>}
            </div>

            <div className="text-center mt-4 pt-2">
              <button type="submit" className="btn-primary-accent w-100 py-2" disabled={loading || !!fileError}>
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-4 alert border-0 ${message.includes('successfully') ? 'alert-success bg-success bg-opacity-10 text-success' : 'alert-danger bg-danger bg-opacity-10 text-danger'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPost;
