import { useState } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const useVideoActions = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);

    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)?|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const updateVideoDescription = async (username, videoLink, landingPage) => {
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            throw new Error('Invalid YouTube video link');
        }

        setIsUpdating(true);
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/update-video-description/${videoId}`, {
                userId: username,
                url: landingPage
            });
            return response.data;
        } finally {
            setIsUpdating(false);
        }
    };

    // Add other video-related functions here...

    return {
        isUpdating,
        isReplacing,
        extractVideoId,
        updateVideoDescription,
        // ... other functions
    };
}; 