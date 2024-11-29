import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Fetch offers for the user
export const fetchOffers = async (username) => {
    try {
        const response = await axios.get(`https://${SERVER_URL}/api/offers/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching offers:', error);
        return []; // Return an empty array on error
    }
};

export const fetchSalesData = async (username) => {
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
                sale_count: Number(offer.sale_count),
                call_booking_count: Number(offer.call_booking_count)
            }))
        }));

        console.log(formattedData);
        return formattedData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
    }
};

export const handleLoginWithYouTube = (username) => {
    const url = `https://${SERVER_URL}/api/auth?userId=${username}`;
    window.open(url, '_blank');
};

export const handleLogout = async (username) => {
    try {
        const response = await axios.post(`https://${SERVER_URL}/api/logout-youtube`, { userId: username });
        if (response.data.success) {
            console.log('Logged out successfully');
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

export const checkYouTubeLogin = async (username) => {
    try {
        const response = await axios.post(`https://${SERVER_URL}/api/check-yt-login`, { userId: username });
        return response.data
    } catch (error) {
        console.error('Error checking YouTube login:', error);
    }
    return null
};

export const fetchDataByDateRange = async (username, start, end) => {
    try {
        const response = await axios.get(`https://${SERVER_URL}/api/sales-data-by-date`, {
            params: {
                username: username,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            },
        });

        const data = response.data;
        console.log('date-ranged data', data);
        return data
    } catch (error) {
        console.error('Error fetching data by date range:', error);
    }
};