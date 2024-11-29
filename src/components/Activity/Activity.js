import React from 'react';
import axios from 'axios';
import './Activity.css';
import { useRevit } from '../../contexts/RevitContext';
import { useQuery } from '@tanstack/react-query';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Activity = () => {
    const { username } = useRevit();
    const { data: conversions, error, isLoading } = useQuery({
        queryKey: ['latestConversions', username],
        queryFn: async () => {
            const response = await axios.get(`https://${SERVER_URL}/api/get-latest-conversions/${username}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching latest conversions</div>;

    return (
        <div className="activity-container">
            <h2>Latest Conversions</h2>
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
