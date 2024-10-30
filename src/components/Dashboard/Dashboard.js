import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react'; // Clerk authentication
import './Dashboard.css'; // Importing CSS file
import axios from 'axios';

const SERVER_URL = 'revenue-node-server.vercel.app';

const Dashboard = () => {
    const { isSignedIn, user, isLoaded } = useUser(); // Clerk authentication

    const [salesData, setSalesData] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoLink, setVideoLink] = useState('');  // Video link state
    const [videoId, setVideoId] = useState('');  // Video ID state
    const [videoDetails, setVideoDetails] = useState(null); 
    const [youtubeName, setYoutubeName] = useState(null); // State for YouTube name
    const [username, setUsername] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [landingPage, setLandingPage] = useState(''); // State for landing page input
    const [cta, setCta] = useState(''); // State for CTA input
    const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh button
    const [linkAction, setLinkAction] = useState('new'); // State for link action
    const [isUpdating, setIsUpdating] = useState(false); // State for update button
    const [offers, setOffers] = useState([]); // State for offers
    const [selectedOffer, setSelectedOffer] = useState('all'); // State for selected offer
    const [oldLink, setOldLink] = useState('');
    const [newLink, setNewLink] = useState('');
    const [isReplacing, setIsReplacing] = useState(false);
    const [targetUrl, setTargetUrl] = useState(''); // State for target URL input

    // Function to extract video ID from YouTube URL
    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)?|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/logout-youtube`, { userId: username });
            if (response.data.success) {
                console.log('Logged out successfully');
                // Optionally, redirect the user or update the UI
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Fetch sales data from the server
    const fetchSalesData = async (username) => {
        try {
            const response = await fetch(`https://${SERVER_URL}/api/sales/${username}`, { withCredentials: true });
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }
            const data = await response.json();

            // Convert click_count and sale_count to numbers
            const formattedData = data.map(resource => ({
                ...resource,
                offers: resource.offers.map(offer => ({
                    ...offer,
                    click_count: Number(offer.click_count),
                    sale_count: Number(offer.sale_count)
                }))
            }));

            console.log(formattedData);
            setSalesData(formattedData);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Fetch offers for the user
    const fetchOffers = async (username) => {
        try {
            const response = await axios.get(`https://${SERVER_URL}/api/offers/${username}`);
            setOffers(response.data);
        } catch (error) {
            console.error('Error fetching offers:', error);
            setError('Error fetching offers');
        }
    };

    const fetchVideoById = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            };
    
            const response = await axios.get(`https://${SERVER_URL}/api/youtube-video/${videoId}`, config);
    
            console.log('Video Details:', response.data);
            setVideoDetails(response.data);
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
                setError(`Error: ${error.response.data.message || 'Fetching video failed'}`);
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Error: No response from the server');
            } else {
                console.error('Error message:', error.message);
                setError('Error fetching video.');
            }
        }
    };

    // Function to refresh YouTube data
    const refreshYouTubeData = async () => {
        setIsRefreshing(true); // Set refreshing state to true
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/refresh-yt-data/${username}`);
            alert(response.data.message);
            fetchSalesData(username); // Refresh sales data after updating YouTube data
        } catch (error) {
            console.error('Error refreshing YouTube data:', error);
            alert('Error refreshing YouTube data');
        } finally {
            setIsRefreshing(false); // Reset refreshing state
        }
    };

    // Function to update tracking links for all videos
    const updateTrackingLinksForAllVideos = async () => {
        setIsUpdating(true); // Set updating state to true
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/add-tracking-to-videos`, {
                userId: username,
                url: landingPage
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error updating tracking links:', error);
            alert('Error updating tracking links');
        } finally {
            setIsUpdating(false); // Reset updating state
        }
    };

    // Function to handle link action
    const handleLinkAction = async () => {
        console.log(username)
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            alert('Invalid YouTube video link');
            return;
        }
        setVideoId(videoId); // Set the extracted video ID

        setIsUpdating(true); // Set updating state to true
        try {
            // Update existing link
            const response = await axios.put(`https://${SERVER_URL}/api/update-video-description/${videoId}`, {
                userId: username,
                url: landingPage
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error handling link action:', error);
            alert('Error handling link action');
        } finally {
            setIsUpdating(false); // Reset updating state
        }
    };

    // useEffect to update the username to user.id once the user is loaded
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            setUsername(user.id);
        }
    }, [isLoaded, isSignedIn, user]);

    // useEffect to fetch sales data and offers once the username is set/changed
    useEffect(() => {
        if (username) {
            fetchSalesData(username);
            fetchOffers(username);
        }
    }, [username]);

    // useEffect to check YouTube login status
    useEffect(() => {
        const checkYouTubeLogin = async () => {
            try {
                const response = await axios.post(`https://${SERVER_URL}/api/check-yt-login`, { userId: username });
                if (response.data.loggedIn) {
                    console.log(response.data);
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

    // Filter and aggregate sales data based on selected offer
    const filteredSales = salesData.map((resource) => {
        let totalClicks = 0;
        let totalSales = 0;

        resource.offers.forEach((offer) => {
            if (selectedOffer === 'all' || offer.offer_name === selectedOffer) {
                totalClicks += offer.click_count;
                totalSales += offer.sale_count;
            }
        });

        return {
            ...resource,
            totalClicks,
            totalSales,
        };
    }).filter((resource) => {
        // Exclude resources where both clicks and sales are zero
        return (resource.totalClicks > 0 || resource.totalSales > 0) &&
               (filterType === 'all' || resource.category === filterType);
    });

    const sortedSales = React.useMemo(() => {
        let sortableSales = [...filteredSales];
        if (sortConfig.key !== null) {
            sortableSales.sort((a, b) => {
                const aValue = Number(a[sortConfig.key]) || 0; // Convert to number, default to 0 if NaN
                const bValue = Number(b[sortConfig.key]) || 0; // Convert to number, default to 0 if NaN

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableSales;
    }, [filteredSales, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const replaceLinksInVideos = async () => {
        setIsReplacing(true); // Set replacing state to true
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/replace-link-in-videos`, {
                userId: username,
                oldLink,
                newLink
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error replacing links:', error);
            alert('Error replacing links');
        } finally {
            setIsReplacing(false); // Reset replacing state
        }
    };

    // Function to clean link in video description
    const cleanLinkInVideo = async () => {
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            alert('Invalid YouTube video link');
            return;
        }

        try {
            const response = await axios.put(`https://${SERVER_URL}/api/clean-link-in-video/${videoId}`, {
                userId: username,
                targetUrl
            });

            alert(response.data.message);
        } catch (error) {
            console.error('Error cleaning link in video:', error);
            alert('Error cleaning link in video');
        }
    };

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
            <div className="table-container">
                <h1>Welcome to Revit!</h1>
                {youtubeName ? (
                    <div>
                    <p>Logged in as: {youtubeName}</p>
                        <button onClick={handleLogout}>Logout from YouTube</button>
                    </div>
                ) : (
                    <div>
                        <a href={`https://${SERVER_URL}/api/auth?userId=${user.id}`} target='_blank'>
                            <button>Login with YouTube</button>
                        </a>
                    </div>
                )}

                <button onClick={refreshYouTubeData} disabled={isRefreshing}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh YouTube Data'}
                </button>

                <h2>Sales and Clicks Dashboard</h2>
                {/* Category Filter Dropdown */}
                <div className="filter-container">
                    <label htmlFor="category-filter">Filter by Category:</label>
                    <select
                        id="category-filter"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="video">Video</option>
                        <option value="email">Email</option>
                        {/* Add more categories as needed */}
                    </select>
                </div>

                {/* Offer Filter Dropdown */}
                <div className="filter-container">
                    <label htmlFor="offer-filter">Filter by Offer:</label>
                    <select
                        id="offer-filter"
                        value={selectedOffer}
                        onChange={(e) => setSelectedOffer(e.target.value)}
                    >
                        <option value="all">All Offers</option>
                        {offers.map((offer) => (
                            <option key={offer.id} value={offer.name}>
                                {offer.name}
                            </option>
                        ))}
                    </select>
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
                                <th
                                    className={`sortable ${sortConfig.key === 'views' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('views')}
                                >
                                    Views {sortConfig.key === 'views' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className={`sortable ${sortConfig.key === 'totalClicks' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('totalClicks')}
                                >
                                    Clicks {sortConfig.key === 'totalClicks' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className={`sortable ${sortConfig.key === 'totalSales' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('totalSales')}
                                >
                                    Conversions {sortConfig.key === 'totalSales' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th>Click %</th>
                                <th>Conversions % from Clicks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSales.map((sale, index) => {
                                const clickPercentage = sale.views ? ((sale.totalClicks / sale.views) * 100).toFixed(2) : 'N/A';
                                const salesPercentage = sale.totalClicks ? ((sale.totalSales / sale.totalClicks) * 100).toFixed(2) : 'N/A';
                                const formattedViews = sale.views ? new Intl.NumberFormat().format(sale.views) : 'N/A';
                                return (
                                    <tr key={index}>
                                        <td>{sale.category}</td>
                                        <td>{sale.category === 'video' && sale.youtube_title ? sale.youtube_title : sale.name}</td>
                                        <td>{formattedViews}</td> 
                                        <td>{Number(sale.totalClicks)}</td>
                                        <td>{Number(sale.totalSales)}</td>
                                        <td>{clickPercentage}%</td>
                                        <td>{salesPercentage}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="actions-container">
                {/* Section for updating tracking links for all videos */}
                <div className="update-tracking-links">
                    <h3>Update Tracking Links for All Videos</h3>
                    <input
                        type="text"
                        placeholder="Enter landing page URL"
                        value={landingPage}
                        onChange={(e) => setLandingPage(e.target.value)}
                    />
                    <button onClick={updateTrackingLinksForAllVideos} disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Update Tracking Links'}
                    </button>
                </div>

                {/* Section for adding or updating tracking link to a specific video */}
                <div className="add-update-link">
                    <h3>Update Tracking Link for a Specific Video</h3>
                    <input
                        type="text"
                        placeholder="Enter YouTube video link"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter landing page URL"
                        value={landingPage}
                        onChange={(e) => setLandingPage(e.target.value)}
                    />
                    <button onClick={handleLinkAction} disabled={isUpdating}>
                        {isUpdating ? 'Processing...' : 'Update Link'}
                    </button>
                </div>

                {/* New Section for Replacing Links in Video Descriptions */}
                <div className="replace-link-in-videos">
                    <h3>Replace Links in Video Descriptions</h3>
                    <input
                        type="text"
                        placeholder="Enter old link"
                        value={oldLink}
                        onChange={(e) => setOldLink(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter new link"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                    />
                    <button onClick={replaceLinksInVideos} disabled={isReplacing}>
                        {isReplacing ? 'Replacing...' : 'Replace Links'}
                    </button>
                </div>

                {/* Section for cleaning link in a specific video */}
                <div className="clean-link-in-video">
                    <h3>Clean Link in Video Description</h3>
                    <input
                        type="text"
                        placeholder="Enter YouTube video link"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter target URL"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                    />
                    <button onClick={cleanLinkInVideo}>
                        Clean Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
