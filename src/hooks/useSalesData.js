import { useState } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const useSalesData = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSalesData = async (username) => {
        try {
            const response = await fetch(`https://${SERVER_URL}/api/sales/${username}`, { withCredentials: true });
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }
            const data = await response.json();

            const formattedData = data.map(resource => ({
                ...resource,
                offers: resource.offers.map(offer => ({
                    ...offer,
                    click_count: Number(offer.click_count),
                    sale_count: Number(offer.sale_count)
                }))
            }));

            setSalesData(formattedData);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchDataByDateRange = async (username, start, end) => {
        try {
            const response = await axios.get(`https://${SERVER_URL}/api/sales-data-by-date`, {
                params: {
                    username,
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                },
            });
            setSalesData(response.data);
        } catch (error) {
            setError('Error fetching data by date range');
        }
    };

    return { salesData, loading, error, fetchSalesData, fetchDataByDateRange };
}; 