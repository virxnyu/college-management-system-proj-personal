import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications'; // --- 1. IMPORT THE NEW NOTIFICATIONS COMPONENT ---
import './DashboardHeader.css';

const DashboardHeader = ({ title, subtitle }) => {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Use the 'name' field from the token for a more personal touch
                setUserName(payload.name || payload.email); 
            } catch (e) {
                console.error("Failed to decode token:", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/"); // Navigate to the landing page on logout
    };

    return (
        <header className="dashboard-header-main">
            <div className="header-content">
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            <div className="header-user-info">
                <span className="welcome-message">Welcome, {userName}!</span>
                
                {/* --- 2. ADD THE NOTIFICATIONS COMPONENT HERE --- */}
                <Notifications />

                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
        </header>
    );
};

export default DashboardHeader;
