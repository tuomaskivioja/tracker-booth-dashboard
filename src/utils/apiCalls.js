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