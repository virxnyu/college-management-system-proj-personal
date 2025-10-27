import React from 'react';
import {
    Navigate,
    useLocation
} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

// Updated ProtectedRoute
const ProtectedRoute = ({
    children
}) => {
    const {
        currentUser,
        loading
    } = useAuth(); // Get user state and loading status
    const location = useLocation();

    if (loading) {
        // Show a loading indicator while checking auth state initially
        // You can replace this with a proper loading spinner component
        return <div > Checking authentication... < /div>;
    }

    if (!currentUser) {
        // If not logged in after check, redirect to login
        // Pass the original location they tried to visit
        return <Navigate to = "/login"
        state = {
            {
                from: location
            }
        }
        replace / > ;
    }

    // If logged in, render the child component
    return children;
};


export default ProtectedRoute;
