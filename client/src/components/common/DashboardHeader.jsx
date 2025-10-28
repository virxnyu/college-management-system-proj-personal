import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import Firebase auth functions
import { auth } from '../../firebase'; // Assuming your firebase instance is exported here
import Notifications from './Notifications'; 
import './DashboardHeader.css';

const DashboardHeader = ({ title, subtitle }) => {
    const [userName, setUserName] = useState('User'); // Default to 'User'
    const [loadingUser, setLoadingUser] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoadingUser(true);
            if (user) {
                try {
                    // Get the user's ID token
                    const idTokenResult = await user.getIdTokenResult();
                    
                    // Option 1: Try to get the name from the token's claims (best practice for MERN+Firebase)
                    // We assume that the roleMiddleware or register process updates the user's custom claims
                    const nameFromClaim = idTokenResult.claims.name; 

                    if (nameFromClaim) {
                        setUserName(nameFromClaim);
                    } else {
                        // Option 2: Fallback to email (if custom claims haven't been set or read)
                        // If the backend stored the user's name, we rely on the client side to retrieve it or fall back to email
                        setUserName(user.displayName || user.email || 'User');
                    }
                    
                } catch (e) {
                    console.error("Failed to decode token or get claims:", e);
                    setUserName(user.email || 'User'); 
                }
            } else {
                 setUserName('Guest'); 
            }
            setLoadingUser(false);
        });

        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth); // Use Firebase sign out
            localStorage.clear(); // Clear local storage (token, role, etc.)
            navigate("/"); // Navigate to the landing page on logout
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Show a minimal header while the name is loading, or if the component is used outside the main context.
    const displayUserName = loadingUser ? 'Loading...' : userName;

    return (
        <header className="dashboard-header-main">
            <div className="header-content">
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            <div className="header-user-info">
                {/* Display the greeting with the fetched username */}
                <span className="welcome-message">Welcome, {displayUserName}!</span>
                
                <Notifications />

                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
        </header>
    );
};

export default DashboardHeader;
