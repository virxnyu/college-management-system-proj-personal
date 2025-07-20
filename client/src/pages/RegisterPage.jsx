import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios';
import './Auth.css'; // Use the new shared CSS

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const endpointMap = {
            student: '/student/register',
            teacher: '/teacher/register',
        };

        try {
            await axios.post(endpointMap[role], { name, email, password });
            setMessage('Registration successful! Please log in.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="student">I am a Student</option>
                            <option value="teacher">I am a Teacher</option>
                        </select>
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                </form>
                {message && <p className="auth-message success">{message}</p>}
                {error && <p className="auth-message error">{error}</p>}
                <p className="switch-auth-link">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
