    import axios from 'axios';
    import { auth } from './firebase'; // Import your initialized Firebase auth instance

    // Create a new Axios instance
    const instance = axios.create({
        // Set the base URL for all API requests to your backend
        // The '/api' prefix matches how your server routes are set up
        baseURL: '/api'
        // Note: We don't need 'http://localhost:5000' because the proxy in
        // client/package.json handles forwarding during development.
        // For production, Netlify/Render handle proxying or direct API calls.
    });

    // --- CRITICAL: Add Request Interceptor ---
    // This function runs BEFORE every request is sent
    instance.interceptors.request.use(
        async (config) => {
            // Get the current logged-in user from Firebase Auth
            const user = auth.currentUser;

            if (user) {
                try {
                    // Get the Firebase ID token for the current user.
                    // Firebase automatically handles refreshing the token if it's expired.
                    const token = await user.getIdToken();

                    // Add the token to the Authorization header
                    config.headers['Authorization'] = `Bearer ${token}`;
                    console.log("Interceptor adding token:", token ? 'Token added' : 'No token'); // Debug log
                } catch (error) {
                    console.error("Error getting Firebase ID token:", error);
                    // Optionally handle the error, e.g., redirect to login
                    // window.location.href = '/login';
                    return Promise.reject(error); // Reject the request if token fetch fails
                }
            } else {
                 console.log("Interceptor: No current user found."); // Debug log
            }

            return config; // Continue with the request configuration
        },
        (error) => {
            // Handle request configuration errors
            console.error("Axios request interceptor error:", error);
            return Promise.reject(error);
        }
    );

    export default instance;
    

