const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Function to generate a JWT token
const generateToken = (userId, role) => {
    const payload = {
        id: userId,
        role: role,
    };
    const options = {
        expiresIn: '1h', // Token expiration time
    };
    return jwt.sign(payload, JWT_SECRET, options);
};

// Function to verify a JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // Return null if token verification fails
    }
};

module.exports = {
    JWT_SECRET,
    generateToken,
    verifyToken,
};
