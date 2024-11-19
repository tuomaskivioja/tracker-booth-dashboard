import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react'; // Clerk authentication
import { fetchOffers, fetchSalesData } from '../utils/apiCalls'; // Assuming fetchSalesData is defined here

// Create a context for the Revit application
const RevitContext = createContext();

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create a provider component
export const RevitProvider = ({ children }) => {
    const { isSignedIn, user, isLoaded } = useUser();
    const [username, setUsername] = useState(null);
    const [offers, setOffers] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [offersCache, setOffersCache] = useState({});
    const [salesCache, setSalesCache] = useState({});

    

    // Function to fetch and set the username
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            setUsername(user.id);
        }
    }, [isLoaded, isSignedIn, user]);

    // useEffect to fetch sales data and offers once the username is set/changed
    useEffect(() => {
        const fetchData = async () => {
            if (username) {
                const data = await fetchSalesData(username);
                setSalesData(data);
            }
        };

        fetchData();
    }, [username]);

    // Function to load offers with caching
    useEffect(() => {
        const loadOffers = async () => {
            if (username) {
                const cachedData = offersCache[username];
                const currentTime = new Date().getTime();

                // Check if cached data exists and is not expired
                if (cachedData && (currentTime - cachedData.timestamp < CACHE_EXPIRATION_TIME)) {
                    setOffers(cachedData.data);
                } else {
                    try {
                        const userOffers = await fetchOffers(username);
                        setOffers(userOffers);
                        // Cache the offers with the current timestamp
                        setOffersCache(prevCache => ({
                            ...prevCache,
                            [username]: {
                                data: userOffers,
                                timestamp: currentTime
                            }
                        }));
                    } catch (error) {
                        console.error('Error loading offers:', error);
                    }
                }
            }
        };

        loadOffers();
    }, [username, offersCache]);

    useEffect(() => {
        const loadSalesData = async () => {
            if (username) {
                const cachedData = salesCache[username];
                const currentTime = new Date().getTime();

                // Check if cached data exists and is not expired
                if (cachedData && (currentTime - cachedData.timestamp < CACHE_EXPIRATION_TIME)) {
                    setSalesData(cachedData.data);
                } else {
                    try {
                        const userSalesData = await fetchSalesData(username);
                        setSalesData(userSalesData);
                        // Cache the sales data with the current timestamp
                        setSalesCache(prevCache => ({
                            ...prevCache,
                            [username]: {
                                data: userSalesData,
                                timestamp: currentTime
                            }
                        }));
                    } catch (error) {
                        console.error('Error loading sales data:', error);
                    }
                }
            }
        };

        loadSalesData();
    }, [username, salesCache]);

    return (
        <RevitContext.Provider value={{ username, offers, salesData, setSalesData }}>
            {children}
        </RevitContext.Provider>
    );
};

// Custom hook to use the Revit context
export const useRevit = () => {
    return useContext(RevitContext);
};
