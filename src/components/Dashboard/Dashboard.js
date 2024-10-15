import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react'; // Clerk for authentication
import './Dashboard.css'; // Importing CSS file
import axios from 'axios';

const SERVER_URL = 'revenue-node-server.vercel.app'

const Dashboard = () => {
    const { isSignedIn, user, isLoaded } = useUser(); // Clerk authentication

    const [salesData, setSalesData] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoId, setVideoId] = useState('');  // Video ID state
    const [videoDetails, setVideoDetails] = useState(null); 
    const [youtubeName, setYoutubeName] = useState(null); // State for YouTube name

    const [username, setUsername] = useState('');

    // Fetch sales data from the server
    const fetchSalesData = async (username) => {
        try {
            const response = await fetch(`https://${SERVER_URL}/api/sales/${username}`, { withCredentials: true });
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }
            const data = await response.json();
            setSalesData(data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchVideoById = async () => {
        try {
            // If you need to add authentication tokens (e.g., JWT) to the headers
            const config = {
                headers: {
                    // Example for including an authentication token in the headers
                    'Content-Type': 'application/json'
                },
                withCredentials: true,  // If cookies are used for session management
            };
    
            // Make the request to the backend
            const response = await axios.get(`https://${SERVER_URL}/api/youtube-video/${videoId}`, config);
    
            console.log('Video Details:', response.data);
            setVideoDetails(response.data);
        } catch (error) {
            if (error.response) {
                // Server responded with a status code other than 2xx
                console.error('Error response:', error.response.data);
                setError(`Error: ${error.response.data.message || 'Fetching video failed'}`);
            } else if (error.request) {
                // The request was made, but no response was received
                console.error('Error request:', error.request);
                setError('Error: No response from the server');
            } else {
                // Something else happened
                console.error('Error message:', error.message);
                setError('Error fetching video.');
            }
        }
    };

    // Function to refresh YouTube data
    const refreshYouTubeData = async () => {
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/refresh-yt-data/${username}`);
            alert(response.data.message);
            fetchSalesData(username); // Refresh sales data after updating YouTube data
        } catch (error) {
            console.error('Error refreshing YouTube data:', error);
            alert('Error refreshing YouTube data');
        }
    };

    // useEffect to update the username to user.id once the user is loaded
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            // Set the username to user.id once loaded
            setUsername(user.id);
        }
    }, [isLoaded, isSignedIn, user]);

    // useEffect to fetch sales data once the username is set/changed
    useEffect(() => {
        if (username) {
            fetchSalesData(username);
        }
    }, [username]);

    // useEffect to check YouTube login status
    useEffect(() => {
        const checkYouTubeLogin = async () => {
            try {
                const response = await axios.post(`https://${SERVER_URL}/api/check-yt-login`, { userId: username });
                if (response.data.loggedIn) {
                    setYoutubeName(response.data.youtubeName);
                }
            } catch (error) {
                console.error('Error checking YouTube login:', error);
            }
        };

        if (username) {
            checkYouTubeLogin();
        }
    }, [username]);

    // Filter sales based on category (all, video, or email)
    const filteredSales =
        filterType === 'all' ? salesData : salesData.filter((sale) => sale.category === filterType);

    // Check if Clerk's user data is loaded
    if (!isLoaded) {
        return <p>Loading user info...</p>;
    }

    // If not signed in, show a message
    if (!isSignedIn) {
        return <div>Not signed in</div>;
    }

    // If signed in, display the sales and clicks dashboard and user's name
    return (
        <div className="dashboard-container">
            <h1>Welcome to Trackr!</h1>
            {youtubeName ? (
                <p>Logged in as: {youtubeName}</p>
            ) : (
                <div>
                    <a href={`https://${SERVER_URL}/api/auth?userId=${user.id}`} target='_blank'>
                        <button>Login with YouTube</button>
                    </a>
                </div>
            )}
        
            <h2>Sales and Clicks Dashboard</h2>{/* Button to refresh YouTube data */}

            <div className="filter-container">
                <label>
                    <input
                        type="radio"
                        value="all"
                        checked={filterType === 'all'}
                        onChange={() => setFilterType('all')}
                    />
                    All
                </label>
                <label>
                    <input
                        type="radio"
                        value="video"
                        checked={filterType === 'video'}
                        onChange={() => setFilterType('video')}
                    />
                    Video
                </label>
                <label>
                    <input
                        type="radio"
                        value="email"
                        checked={filterType === 'email'}
                        onChange={() => setFilterType('email')}
                    />
                    Email
                </label>
            </div>

            <button onClick={refreshYouTubeData}>Refresh YouTube Data</button> 

            {loading ? (
                <p className="loading-message">Loading data...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Source</th>
                            <th>Views</th> 
                            <th>Clicks</th>
                            <th>Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((sale, index) => (
                            <tr key={index}>
                                <td>{sale.category}</td>
                                <td>{sale.category === 'video' && sale.youtube_title ? sale.youtube_title : sale.name}</td>
                                <td>{sale.views || 'N/A'}</td> 
                                <td>{sale.click_count}</td>
                                <td>{sale.sale_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Dashboard;
