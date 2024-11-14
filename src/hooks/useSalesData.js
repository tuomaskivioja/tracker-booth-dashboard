import { useState, useEffect } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const useSalesData = (username) => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSalesData = async () => {
        try {
            const response = await fetch(`https://${SERVER_URL}/api/sales/${username}`, { 
                withCredentials: true 
            });
            if (!response.ok) throw new Error('Failed to fetch sales data');
            
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

    useEffect(() => {
        if (username) {
            fetchSalesData();
        }
    }, [username]);

    return { salesData, loading, error, refreshData: fetchSalesData };
}; 