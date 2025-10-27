import React,
{
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import {
    onAuthStateChanged
} from 'firebase/auth';
import {
    auth
} from '../firebase'; // Import your Firebase auth instance
import axios from '../axios'; // Import your configured axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({
    children
}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state for initial check

    useEffect(() => {
        // This listener fires whenever the user logs in or out
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed. User:", user ? user.uid : null);
            setCurrentUser(user); // Set Firebase user object

            if (user) {
                // If user is logged in, fetch their role from our backend
                try {
                    const idToken = await user.getIdToken();
                    console.log("Fetching role for logged-in user...");
                    const roleResponse = await axios.get('/users/get-role', {
                        headers: {
                            Authorization: `Bearer ${idToken}`
                        }
                    });
                    setUserRole(roleResponse.data.role);
                    localStorage.setItem('userRole', roleResponse.data.role); // Keep localStorage for immediate checks
                    console.log("Role fetched:", roleResponse.data.role);
                } catch (error) {
                    console.error("Error fetching user role after auth state change:", error);
                    // Handle error, maybe sign out user if role fetch fails
                    setUserRole(null);
                    localStorage.removeItem('userRole');
                    // Optionally sign out the Firebase user if role is crucial
                    // await auth.signOut();
                }
            } else {
                // User is logged out
                setUserRole(null);
                localStorage.removeItem('userRole');
                console.log("User logged out, role cleared.");
            }
            setLoading(false); // Finished initial auth check
        });

        // Cleanup function to unsubscribe when component unmounts
        return unsubscribe;
    }, []); // Empty array ensures this runs only once on mount

    const value = {
        currentUser,
        userRole,
        loading // Expose loading state
    };

    // Don't render children until the initial auth check is complete
    return ( <
        AuthContext.Provider value = {
            value
        } > {!loading && children
        } </AuthContext.Provider>
    );
};
