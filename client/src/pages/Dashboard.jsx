import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { signOut } from "firebase/auth"; // Import Firebase sign out
import { auth } from '../firebase'; // Import your Firebase auth instance
import StudentDashboard from "../components/student/StudentDashboard";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
// Assuming you have an AdminDashboard component to import if needed
// import AdminDashboard from "./AdminDashboard"; // Adjust path as necessary

// Updated Dashboard component using AuthContext
function Dashboard() {
    const { currentUser, userRole, loading } = useAuth(); // Get user and role from context
    const navigate = useNavigate();

    // Note: Logout button is now typically placed in DashboardHeader for consistency,
    // but the logic is kept here for reference if needed elsewhere.
    const handleLogout = async () => {
        try {
            await signOut(auth); // Use Firebase sign out
            localStorage.removeItem('userRole'); // Clear the role from localStorage too
            console.log("User signed out successfully.");
            navigate("/login"); // Navigate to login after sign out
        } catch (error) {
            console.error("Error signing out:", error);
            // Optionally show an error message to the user
        }
    };

    // Show loading state while AuthContext is initializing
    if (loading) {
        // You can replace this with a proper loading spinner component
        return <div>Loading dashboard...</div>;
    }

    // If no user is logged in after loading, show message
    // Note: ProtectedRoute should ideally handle the redirect *before* this component renders
    //       if the user isn't authenticated. This is a fallback message.
    if (!currentUser) {
        return <p>❌ Not authenticated. Please login.</p>;
    }

    // Now, determine the dashboard based on userRole from context
    let dashboardContent;
    console.log("Dashboard rendering with role:", userRole); // Debug log

    switch (userRole) {
        case "student":
            dashboardContent = <StudentDashboard />;
            break;
        case "teacher":
            dashboardContent = <TeacherDashboard />;
            break;
        case "admin":
            // Make sure you have an AdminDashboard component imported and configured
            // And ensure your Admin login logic sets the 'admin' role correctly
            dashboardContent = (
                 <div>
                   <h2>👩‍💼 Admin Dashboard Placeholder</h2>
                   <p>Welcome, admin! Content goes here.</p>
                   {/* Example button */}
                   <button onClick={() => navigate("/admin-dashboard")}>
                     ⚙️ Manage Users
                   </button>
                   {/* Add a logout button specific to Admin dashboard if needed */}
                   <button onClick={handleLogout}>Logout Admin</button>
                 </div>
            );
            break;
        default:
            // This case might happen briefly if the role hasn't loaded yet from the backend,
            // or if the role fetched from backend is unexpected (null, undefined).
             console.warn("Unknown or loading role:", userRole);
            dashboardContent = <p>Loading user role or role unknown...</p>;
            // Optional: Automatically log out if the role remains unknown after loading
            // handleLogout();
    }

    // The main dashboard content determined by the switch statement
    // The logout button is now primarily handled by DashboardHeader,
    // so it's commented out here to avoid duplication.
    return (
        <div>
            {dashboardContent}
            {/* The Logout button is now typically inside DashboardHeader
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={handleLogout} className="logout-button">🚪 Logout</button>
            </div> */}
        </div>
    );
}

export default Dashboard;

