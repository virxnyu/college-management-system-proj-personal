import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure this path is correct
import axios from '../axios'; // Use the configured axios instance
import './Auth.css'; // Use the shared Auth CSS

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true);

        try {
            // --- Step 1: Create user in Firebase Authentication ---
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase user created:", user);

            // --- Step 2: ONLY IF FIREBASE SUCCEEDS, save details to your backend ---
            try {
                // Get the Firebase ID Token
                const idToken = await user.getIdToken();

                await axios.post('/users/register-details', {
                    firebaseUid: user.uid,
                    email: user.email,
                    name: name,
                    role: role,
                }, {
                    headers: { Authorization: `Bearer ${idToken}` } // Send token for backend verification (optional but good practice)
                });

                console.log("User details saved to backend.");
                // Registration successful, navigate to login
                navigate('/login');

            } catch (backendError) {
                // Handle errors saving details to your backend
                console.error("Error saving user details to backend:", backendError);
                // Maybe delete the Firebase user if backend save fails? Or just show error.
                setError(`Account created in Firebase, but failed to save details: ${backendError.response?.data?.message || backendError.message}`);
                // Consider adding logic here to potentially delete the Firebase user if the backend save fails
                // await user.delete(); // Example: Be careful with this!
            }

        } catch (firebaseError) {
            // --- Step 3: Handle Firebase Authentication errors ---
            console.error("Firebase registration error:", firebaseError);
            if (firebaseError.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please log in instead.');
            } else if (firebaseError.code === 'auth/weak-password') {
                setError('Password is too weak. Please use at least 6 characters.');
            } else {
                setError(`Registration failed: ${firebaseError.message}`);
            }
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <form className="auth-form" onSubmit={handleRegister}>
                    <h2>Create Your Account</h2>
                    <p>Join EduTrack today.</p>

                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g., John Doe"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Min. 6 characters"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="role">Register as</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            {/* Add Admin option if needed */}
                            {/* <option value="admin">Admin</option> */}
                        </select>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <p className="switch-auth">
                        Already have an account? <Link to="/login">Log in here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;

