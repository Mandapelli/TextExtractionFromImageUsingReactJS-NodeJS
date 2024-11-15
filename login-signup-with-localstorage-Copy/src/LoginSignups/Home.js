import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';  // Correctly import js-cookie

const Home = () => {
    const navigate = useNavigate();
    const sessionTimeout = 60000; // 1 minute (60,000 ms)
    const [logDetails, setLogDetails] = useState([]);  // State to store log history
    const [showLogs, setShowLogs] = useState(false);   // State to toggle log details visibility

    // Function to redirect to Flask app
    const ImageExtraction = () => {
        navigate('/ImageExtraction'); // Navigates to the ImageExtraction page
      };

    // Function to log the user out
    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Function to handle session timeout
    const handleSessionTimeout = () => {
        alert("Session has expired due to inactivity.");
        logout();  // Log the user out after inactivity
    };

    // Function to save login details to cookies
    const saveLoginDetails = () => {
        const currentLoginTime = new Date().toLocaleString();  // Get current time
        let loginHistory = Cookies.get('loginHistory');  // Get previous log history from cookies (as string)

        if (loginHistory) {
            loginHistory = JSON.parse(loginHistory);  // Parse the string into a JSON object
        } else {
            loginHistory = [];  // Initialize as empty array if no history exists
        }

        loginHistory.push(currentLoginTime);  // Add new login time to history
        Cookies.set('loginHistory', JSON.stringify(loginHistory), { expires: 7 });  // Store updated log history in cookies as string
    };

    // Function to load login details from cookies
    const loadLoginDetails = () => {
        const loginHistory = Cookies.get('loginHistory');  // Get login history (as string)
        if (loginHistory) {
            setLogDetails(JSON.parse(loginHistory));  // Parse and update state with login history
        } else {
            setLogDetails([]);  // If no history, set empty array
        }
    };

    // Function to toggle showing log details
    const toggleLogs = () => {
        setShowLogs(!showLogs);
        if (!showLogs) {
            loadLoginDetails();  // Load login details when logs are being shown
        }
    };

    // Use useEffect to handle session timeout and user activity detection
    useEffect(() => {
        let timeout;

        // Save login details on component mount (or when session starts)
        saveLoginDetails();

        // Function to reset the inactivity timer
        const resetTimer = () => {
            clearTimeout(timeout);  // Clear existing timer
            timeout = setTimeout(() => {
                handleSessionTimeout();
            }, sessionTimeout);  // Set new timer for 1 minute
        };

        // Add event listeners for user activity
        const activityEvents = ["mousemove", "keydown", "click"];
        activityEvents.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Start the initial inactivity timer
        timeout = setTimeout(handleSessionTimeout, sessionTimeout);

        // Cleanup function to remove event listeners and clear timer on unmount
        return () => {
            activityEvents.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
            clearTimeout(timeout);
        };
    }, [navigate]);  // Use navigate in dependency array to avoid stale closures

    return (
        <div>
            <Navbar />
            <div className='home'><center>
                <h2>Welcome to Home Page</h2>
                <div>
                    <button onClick={ImageExtraction}>Go to Uplode page</button>
                    <button onClick={logout}>Logout</button>
                </div>
                {/* Log Details Button */}
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <button onClick={toggleLogs}>Log Details</button>
                    {showLogs && (
                        <div className="log-details">
                            <h3>Login History</h3>
                            <ul>
                                {logDetails.length > 0 ? logDetails.map((log, index) => (
                                    <li key={index}>{log}</li>
                                )) : <li>No login history available.</li>}
                            </ul>
                        </div>
                    )}
                </div>
                </center></div>
        </div>
    );
};

export default Home;
