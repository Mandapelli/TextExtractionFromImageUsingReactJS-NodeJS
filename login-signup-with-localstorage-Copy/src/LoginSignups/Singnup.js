import React, { useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if all fields are filled
    if (!formData.name || !formData.email || !formData.password) {
      setMessage('Please enter all details!');
      return;
    }

    try {
      // Make a POST request to your backend
      const response = await axios.post('http://localhost:5000/api/signup', formData);

      // Check if the response is successful
      if (response.status === 201) {
        setMessage('User registered successfully');
        navigate("/login"); // Redirect to login page
      } else {
        setMessage(response.data.message || 'Signup failed');
      }
    } catch (error) {
      // Handle errors from the backend
      setMessage(error.response ? error.response.data.message : 'Signup failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-page">
        <form onSubmit={handleSubmit}>
          <div className="heading">
            <p>Sign Up</p>
          </div>
          <div className="account">
            <input
              type="text"
              name="name"
              placeholder="Enter your Name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <p>Already have an account? <a href='/login'>Login</a></p>
          </div>
          <button type="submit">Sign Up</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
