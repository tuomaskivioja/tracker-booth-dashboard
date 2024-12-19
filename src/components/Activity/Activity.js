import React, { useState } from 'react';
import axios from 'axios';
import './Activity.css';
import { useRevit } from '../../contexts/RevitContext';
import { useQuery } from '@tanstack/react-query';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Activity = () => {
    const { username } = useRevit();
    const [selectedOffer, setSelectedOffer] = useState('all');

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

    const previous30Days = new Date(last30Days);
    previous30Days.setDate(previous30Days.getDate() - 30);
    const previous7Days = new Date(last7Days);
    previous7Days.setDate(previous7Days.getDate() - 7);

    const calculateCounts = (timestamps, startDate, endDate) => {
        return timestamps.filter(timestamp => new Date(timestamp) >= startDate && new Date(timestamp) < endDate).length;
    };

    const clicksCounts = {
        last30DaysCount: calculateCounts(stats.clicks, last30Days, now),
        last7DaysCount: calculateCounts(stats.clicks, last7Days, now),
        previous30DaysCount: calculateCounts(stats.clicks, previous30Days, last30Days),
        previous7DaysCount: calculateCounts(stats.clicks, previous7Days, last7Days),
    };

    const salesCounts = {
        last30DaysCount: calculateCounts(stats.sales, last30Days, now),
        last7DaysCount: calculateCounts(stats.sales, last7Days, now),
        previous30DaysCount: calculateCounts(stats.sales, previous30Days, last30Days),
        previous7DaysCount: calculateCounts(stats.sales, previous7Days, last7Days),
    };

    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? '+∞%' : '0%';
        return `${(((current - previous) / previous) * 100).toFixed(2)}%`;
    };

    // Filter conversions by selected offer
    const filteredConversions = conversions
        .filter(conversion => selectedOffer === 'all' || conversion.offer_name === selectedOffer)
        .slice(0, 20); // Limit to 20 conversions

    // Get unique offer names for the dropdown
    const offerNames = [...new Set(conversions.map(conversion => conversion.offer_name))];

    return (
        <div className="activity-container">
            <h2>Activity Overview</h2>
            <div className="stats-summary">
                <div>
                    <h3>Clicks</h3>
                    <p>Last 30 Days: {clicksCounts.last30DaysCount}</p>
                    <p>
                        <span className="change-text">
                            {calculatePercentageChange(clicksCounts.last30DaysCount, clicksCounts.previous30DaysCount)} vs previous 30 days
                        </span>
                    </p>
                    <p>Last 7 Days: {clicksCounts.last7DaysCount}</p>
                    <p>
                        <span className="change-text">
                            {calculatePercentageChange(clicksCounts.last7DaysCount, clicksCounts.previous7DaysCount)} vs previous 7 days
                        </span>
                    </p>
                </div>
                <div>
                    <h3>Sales</h3>
                    <p>Last 30 Days: {salesCounts.last30DaysCount}</p>
                    <p>
                        <span className="change-text">
                            {calculatePercentageChange(salesCounts.last30DaysCount, salesCounts.previous30DaysCount)} vs previous 30 days
                        </span>
                    </p>
                    <p>Last 7 Days: {salesCounts.last7DaysCount}</p>
                    <p>
                        <span className="change-text">
                            {calculatePercentageChange(salesCounts.last7DaysCount, salesCounts.previous7DaysCount)} vs previous 7 days
                        </span>
                    </p>
                </div>
            </div>

            <h2>Latest Conversions</h2>
            <div className="filter-container">
                <label htmlFor="offer-filter">Filter by Offer:</label>
                <select
                    id="offer-filter"
                    value={selectedOffer}
                    onChange={(e) => setSelectedOffer(e.target.value)}
                >
                    <option value="all">All Offers</option>
                    {offerNames.map((offerName, index) => (
                        <option key={index} value={offerName}>
                            {offerName}
                        </option>
                    ))}
                </select>
            </div>
            <ul>
                {filteredConversions.map((conversion, index) => (
                    <li key={index}>
                        <strong>{conversion.offer_name}</strong> conversion from {conversion.resource_type} <strong>{conversion.youtube_title ? conversion.youtube_title : conversion.resource_name}</strong> on {new Date(conversion.timestamp).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Activity;
