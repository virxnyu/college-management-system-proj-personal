import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    // SVG Icons for features
    const AttendanceIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
    );
    const AssignmentIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M8 8h2"/></svg>
    );
    const NotesIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5"/><path d="m17 13 5 5-5 5"/><path d="M13 18H3"/></svg>
    );

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="nav-logo">
                    EduTrack
                </div>
                <div className="nav-buttons">
                    <button className="nav-btn login" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn register" onClick={() => navigate('/register')}>Register</button>
                </div>
            </nav>

            <main className="landing-content">
                <section className="hero-section">
                    <h1 className="hero-title">Streamline Your Classroom.</h1>
                    <h2 className="hero-subtitle">Effortless attendance, seamless assignments, and direct communication. All in one place.</h2>
                    <button className="hero-cta" onClick={() => navigate('/')}>Get Started Now</button>
                </section>

                <section className="features-section">
                    <div className="feature-card">
                        <AttendanceIcon />
                        <h3>Intelligent Attendance</h3>
                        <p>Mark and track student attendance with our powerful, easy-to-use system. Get instant insights and reports.</p>
                    </div>
                    <div className="feature-card">
                        <AssignmentIcon />
                        <h3>Assignment Management</h3>
                        <p>Create assignments, collect submissions, and manage deadlines. Students can easily upload their work from anywhere.</p>
                    </div>
                    <div className="feature-card">
                        <NotesIcon />
                        <h3>Notes & Resource Sharing</h3>
                        <p>Share important notes, documents, and media files directly with your students for any subject.</p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <p> Made with ❤️ by Viranyu, Aaditya and Hrishav</p>
            </footer>
        </div>
    );
};

export default LandingPage;
