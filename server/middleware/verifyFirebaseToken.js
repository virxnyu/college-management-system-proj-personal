const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
        return res.status(401).send('Unauthorized: No token provided.');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verify the ID token using the Firebase Admin SDK.
        // This verifies the signature, expiration, and audience.
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Add the decoded token (which includes uid, email, etc.) to the request object
        // so downstream controllers can access it.
        req.user = decodedToken; 
        
        console.log(`Firebase token verified successfully for UID: ${decodedToken.uid}`);
        next(); // Token is valid, proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized: Invalid token.');
    }
};

module.exports = verifyFirebaseToken;
