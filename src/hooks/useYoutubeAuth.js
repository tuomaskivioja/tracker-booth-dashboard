import { useState, useEffect } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const useYoutubeAuth = (username) => {
    const [youtubeName, setYoutubeName] = useState(null);

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

    const handleLogout = async () => {
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/logout-youtube`, { userId: username });
            if (response.data.success) {
                setYoutubeName(null);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleLoginWithYouTube = (userId) => {
        const url = `https://${SERVER_URL}/api/auth?userId=${userId}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        if (username) {
            checkYouTubeLogin();
        }
    }, [username]);

    return { youtubeName, handleLogout, handleLoginWithYouTube };
}; 