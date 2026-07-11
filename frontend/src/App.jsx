import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/Signup';
import Home from './components/Home';
import Profile from './components/Profile';
import PostsList from './components/PostsList';
import AddPost from './components/AddPost';
import UserPosts from './components/UserPost';
import Friends from './components/Friends';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleRedirect = (status) => {
    setIsLoggedIn(status); // Handle login state
  };
  return (
    <>
      <Router>
        <Routes>
          <Route path='/'  element={<Login onLogin={handleRedirect}/>}/>
          <Route path='/signup' element={<SignUp />}/>
          <Route path='/home' element={isLoggedIn ?<Home onSignOut={handleRedirect}/>: <Navigate to="/" />}/>
          <Route path='/profile' element={isLoggedIn ?<Profile />: <Navigate to="/" />}/>
          <Route path='/posts' element={isLoggedIn ?<PostsList />: <Navigate to="/" />}/>
          <Route path='/add-post' element={isLoggedIn ?<AddPost />: <Navigate to="/" />}/>
          <Route path='/user-post' element={isLoggedIn ?<UserPosts />: <Navigate to="/" />}/>
          <Route path='/friends' element={isLoggedIn ?<Friends />: <Navigate to="/" />}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
