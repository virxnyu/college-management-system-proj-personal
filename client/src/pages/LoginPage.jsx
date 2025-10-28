import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth
import { useNavigate, Link } from "react-router-dom";
import axios from '../axios'; // Import our configured axios instance
import { auth } from '../firebase'; // Import the initialized Firebase auth instance
import './Auth.css'; // Use the shared Auth CSS

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // We no longer need the 'role' state for login itself
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            // --- Step 1: Sign in with Firebase ---
            console.log("Attempting Firebase sign-in...");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase sign-in successful:", user.uid);

            // --- Step 2: Get Firebase ID Token ---
            // This token proves to our backend that the user is authenticated by Firebase
            const idToken = await user.getIdToken();
            console.log("Got Firebase ID Token.");

            // --- Step 3: Fetch User Role from Our Backend ---
            // We need to ask our backend what role this user has in our system
            console.log("Fetching role from backend...");
            const roleResponse = await axios.get('/users/get-role', {
                 headers: { Authorization: `Bearer ${idToken}` } // Send Firebase token
            });

            // const mongoIdResponse = await axios.get('users/get-mongoid', {
            //     headers: {Authorization: `Bearer ${idToken}` }
            // });

            const userRole = roleResponse.data.role; // Assuming backend sends { role: 'student' } etc.
            console.log("Received role from backend:", userRole);

            if (!userRole) {
                // Handle case where user exists in Firebase Auth but not in our DB yet
                 // This might happen if Step 2 of registration failed previously
                setMessage("Login successful, but profile setup is incomplete. Please contact support or try registering again.");
                await auth.signOut(); // Log them out of Firebase for safety
                setLoading(false);
                return;
            }

            // --- Step 4: Store Role (Optional but recommended for client-side logic) ---
            // Storing the role helps the frontend know which dashboard components to render
            // Note: Security still relies on backend middleware checking the token/role
            localStorage.setItem('userRole', userRole); // Store role locally
            // localStorage.setItem("mongo_id", mongoId);

            // --- Step 5: Navigate to Dashboard ---
            setMessage("Login successful!");
            navigate("/dashboard"); // Redirect to the main dashboard

        } catch (error) {
            console.error("Login failed:", error);
            // Provide more specific feedback based on Firebase error codes
            let friendlyMessage = "Login failed. Please check your email and password.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                 friendlyMessage = "Invalid email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                 friendlyMessage = "Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.";
            } else if (error.response && error.response.status === 404) {
                // Error specifically from our backend role check
                 friendlyMessage = "Authentication successful, but couldn't find your profile in our system. Please contact support.";
                 await auth.signOut(); // Log out of Firebase
            }
             else {
                 // General error from either Firebase or our backend
                 friendlyMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                 // If it wasn't a known auth error, log user out just in case state is inconsistent
                 if (!error.code?.startsWith('auth/')) {
                    await auth.signOut().catch(e => console.error("Error signing out after failed role fetch:", e));
                 }
            }
            setMessage(`❌ ${friendlyMessage}`);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Welcome Back!</h2>
                <p>Log in to access your dashboard.</p>
                <form onSubmit={handleLogin}>
                    {/* Role selection is removed from login form */}
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* Add forgot password link here if needed later */}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                    {message && <p className={`message ${message.startsWith('❌') ? 'error' : 'success'}`}>{message}</p>}
                </form>
                <p className="switch-auth">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;

