import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Activity.css';
import { useRevit } from '../../contexts/RevitContext';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Activity = () => {
    const [conversions, setConversions] = useState([]);
    const [error, setError] = useState(null);

    const { username } = useRevit();

    useEffect(() => {
        const fetchLatestConversions = async () => {
            try {
                const response = await axios.get(`https://${SERVER_URL}/api/get-latest-conversions/${username}`);
                setConversions(response.data);
            } catch (err) {
                console.error('Error fetching latest conversions:', err);
                setError('Error fetching latest conversions');
            }
        };

        fetchLatestConversions();
    }, []);

    return (
        <div className="activity-container">
            <h2>Latest Conversions</h2>
            {error && <p className="error-message">{error}</p>}
            <ul>
                {conversions.map((conversion, index) => (
                    <li key={index}>
                        <strong>{conversion.offer_name}</strong> conversion from {conversion.resource_type} <strong>{conversion.youtube_title ? conversion.youtube_title : conversion.resource_name}</strong> on {new Date(conversion.timestamp).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Activity;
