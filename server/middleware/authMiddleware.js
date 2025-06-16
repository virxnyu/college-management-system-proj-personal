const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Auth Header:", authHeader); // 👈 debug log

  if (!authHeader) return res.status(401).json({ message: "Access Denied: No Token Provided" });

  const token = authHeader.split(" ")[1];
  console.log("Token Extracted:", token); // 👈 debug log

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT Error:", err.message); // 👈 debug log
      return res.status(400).json({ message: "Invalid Token" });
    }

    req.user = decoded;
    console.log("Decoded:", decoded); // 👈 debug log
    next();
  });
};

module.exports = verifyToken;
