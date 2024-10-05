// Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Importing CSS for Sidebar

const Sidebar = () => {
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
            </ul>
            <div className="footer">
                © 2024 MyApp
            </div>
        </div>
    );
};

export default Sidebar;
