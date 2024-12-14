import React from 'react';
import axios from 'axios';
import './Activity.css';
import { useRevit } from '../../contexts/RevitContext';
import { useQuery } from '@tanstack/react-query';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Activity = () => {
    const { username } = useRevit();

    // Fetch latest conversions
    const { data: conversions, error: conversionsError, isLoading: isLoadingConversions } = useQuery({
        queryKey: ['latestConversions', username],
        queryFn: async () => {
            const response = await axios.get(`https://${SERVER_URL}/api/get-latest-conversions/${username}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch clicks and sales stats
    const { data: stats, error: statsError, isLoading: isLoadingStats } = useQuery({
        queryKey: ['stats', username],
        queryFn: async () => {
            const response = await axios.get(`https://${SERVER_URL}/api/get-stats/${username}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });

    if (isLoadingConversions || isLoadingStats) return <div>Loading...</div>;
    if (conversionsError || statsError) return <div>Error fetching data</div>;

    // Calculate clicks and sales for the last 30 and 7 days
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    const calculateCounts = (timestamps) => {
        const last30DaysCount = timestamps.filter(timestamp => new Date(timestamp) >= last30Days).length;
        const last7DaysCount = timestamps.filter(timestamp => new Date(timestamp) >= last7Days).length;
        return { last30DaysCount, last7DaysCount };
    };

    const clicksCounts = calculateCounts(stats.clicks);
    const salesCounts = calculateCounts(stats.sales);

    return (
        <div className="activity-container">
            <h2>Activity Overview</h2>
            <div className="stats-summary">
                <div>
                    <h3>Clicks</h3>
                    <p>Last 30 Days: {clicksCounts.last30DaysCount}</p>
                    <p>Last 7 Days: {clicksCounts.last7DaysCount}</p>
                </div>
                <div>
                    <h3>Sales</h3>
                    <p>Last 30 Days: {salesCounts.last30DaysCount}</p>
                    <p>Last 7 Days: {salesCounts.last7DaysCount}</p>
                </div>
            </div>

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
