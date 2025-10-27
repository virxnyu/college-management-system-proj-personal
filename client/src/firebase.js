import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Add imports for other Firebase services if you use them later (e.g., getFirestore)

// Your web app's Firebase configuration (FROM STEP 2b)
const firebaseConfig = {
  apiKey: "AIzaSyAOpkSAZtKpoCBn6my1S4RANCdXgMBV3CM", // --- Make sure this is your actual key ---
  authDomain: "edutrack-college-system.firebaseapp.com",
  projectId: "edutrack-college-system",
  storageBucket: "edutrack-college-system.firebasestorage.app", // Adjusted domain
  messagingSenderId: "62976943287",
  appId: "1:62976943287:web:d3f131e6ee59c8597fd932"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export the auth instance to be used in other components
export { auth };

// You can also initialize and export other services here if needed later
// export const db = getFirestore(app);
