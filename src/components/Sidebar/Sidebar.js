// Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Importing CSS for Sidebar
import { SignOutButton } from '@clerk/clerk-react';
import { useRevit } from '../../contexts/RevitContext';


const Sidebar = () => {
    const { username } = useRevit();
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;
    
    const openBillingPortal = async () => {
        try {
            const response = await fetch(`https://${SERVER_URL}/api/create-billing-portal-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: username }), // Replace 'currentUserId' with actual user ID
            });

            if (!response.ok) {
                throw new Error('Failed to create billing portal session');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Error opening billing portal:', error);
        }
    };

    return (
        <div className="sidebar">
            <h2>Menu</h2>
            <ul>
                <li>
                    <NavLink to="/dashboard" activeClassName="active">
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/code" activeClassName="active">
                        Code
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/activity" activeClassName="active">
                        Conversion activity
                    </NavLink>
                </li>
                <li>
                    <button onClick={openBillingPortal} className="billing-portal-button">
                        Manage subscription
                    </button>
                </li>
            </ul>
            <SignOutButton displayName="Sign out from Revit" style={{ backgroundColor: '#e74c3c' }} />
            <div className="footer">
                © 2025 Revit
            </div>
        </div>
    );
};

export default Sidebar;
