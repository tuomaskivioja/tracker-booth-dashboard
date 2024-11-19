import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react'; // Clerk authentication/ Clerk authenticatio

// Create a context for the Revit application
const RevitContext = createContext();

// Create a provider component
export const RevitProvider = ({ children }) => {
    const { isSignedIn, user, isLoaded } = useUser();
    const [username, setUsername] = useState(null);

    // Function to fetch and set the username
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            setUsername(user.id);
        }
    }, [isLoaded, isSignedIn, user]);

    return (
        <RevitContext.Provider value={{ username }}>
            {children}
        </RevitContext.Provider>
    );
};

// Custom hook to use the Revit context
export const useRevit = () => {
    return useContext(RevitContext);
};
