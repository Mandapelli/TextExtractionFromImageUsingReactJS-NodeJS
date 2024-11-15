import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // Declare state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Asynchronous handleLogin function using Axios
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMsg('Email and password are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      
      // Check if response contains the message property
      if (response.data && response.data.message) {
        setMsg(response.data.message); // Display the message property
      }

      if (response.data && response.data.message === 'Login successful') {
        localStorage.setItem('currentUser', email); // Store current user session
        navigate('/home'); // Redirect to home on success
      }
    } catch (error) {
      // Handle axios error when email or password is incorrect
      if (error.response && error.response.data) {
        setMsg(error.response.data.message || 'An error occurred');
      } else {
        setMsg('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {msg && <p>{msg}</p>} {/* Display error or success message */}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
