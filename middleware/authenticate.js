// Import required modules
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Define secret key for JWT authentication
const secretKey = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check for the presence of the authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Invalid or missing authorization header');
    return res.status(401).send('Invalid or missing authorization header');
  }
  
  // Extract token from the header
  const token = authHeader.split(' ')[1];
  console.log('Received token:', token);
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);
    
    // Attach decoded user data to request object
    req.user = decoded;
    
    // Call the next middleware
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    
    // Handle different types of errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).send('Invalid token format');
    } else {
      return res.status(500).send('Token verification failed');
    }
  }
};

// Export the middleware
module.exports = verifyToken;
