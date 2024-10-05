import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react'; // Clerk for authentication
import './Dashboard.css'; // Importing CSS file

const Dashboard = () => {
    const { isSignedIn, user, isLoaded } = useUser(); // Clerk authentication

    const [salesData, setSalesData] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the username (initially set as 'InternetMadeCoder', but updated to user.id when available)
    const [username, setUsername] = useState('');

    // Fetch sales data from the server
    const fetchSalesData = async (username) => {
        try {
            const response = await fetch(`https://revenue-node-server.vercel.app/api/sales/${username}`);
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
            <h1>Welcome to Tracker Booth!</h1>
            <h2>Sales and Clicks Dashboard</h2>

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
                            <th>Clicks</th>
                            <th>Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((sale, index) => (
                            <tr key={index}>
                                <td>{sale.category}</td>
                                <td>{sale.name}</td>
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
