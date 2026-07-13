const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user/`;


// Sign up function
export const signUpUser = async (username, email, password) => {
    const response = await fetch(`${API_URL}signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          username:username,
          email:email,
          password:password
      }),
    });
  
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Signup failed');
    }
  
    return await response.json();
  };


// Login function
export const loginUser = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username, // Include username
          password: password, // Include password
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('username', data.username);
        console.log('email :',data.email);
        console.log('Access Token:', data.access);
        console.log('Refresh Token:', data.refresh);
  
        // Store tokens in localStorage
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email)
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        return data;
      } else {
        const error = await response.json();
        console.error('Login failed:', error.error);
        throw new Error(error.error || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  };


