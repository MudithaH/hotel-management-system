
const jwt = require('jsonwebtoken');
const { findOne, pool } = require('../config/db');


const authenticateToken = async (req, res, next) => {
  try {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const userQuery = `
      SELECT s.StaffID, s.Name, s.Email, s.BranchID, s.DesignationID,
             d.Designation as Role, hb.Address as BranchAddress, hb.City as BranchCity
      FROM staff s
      JOIN designation d ON s.DesignationID = d.DesignationID
      JOIN hotelBranch hb ON s.BranchID = hb.BranchID
      WHERE s.StaffID = ?
    `;
    
    const userResult = await findOne(userQuery, [decoded.staffId]);
    
    if (!userResult.success || !userResult.data) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add user info to request object for use in routes
    req.user = userResult.data;
    
    // Set MySQL session variable for audit tracking
    try {
      const connection = await pool.getConnection();
      await connection.query('SET @current_staff_id = ?', [req.user.StaffID]);
      connection.release();
    } catch (error) {
      console.error('Failed to set audit session variable:', error);
      // Don't fail the request if audit tracking fails
    }
    
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }
  }
};

// Check if user is admin (DesignationID = 1)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.DesignationID !== 1) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }

  next();
};

// Check if user is staff (any designation) - for general staff routes
const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Both admin (1) and staff (2) can access staff routes
  if ( req.user.DesignationID !== 2) {
    return res.status(403).json({ 
      success: false, 
      message: 'Staff access required' 
    });
  }

  next();
};

// Check if user belongs to the same branch (for branch-specific operations)
const requireSameBranch = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin can only access their own branch data
  // This middleware can be used to enforce branch-level data isolation
  req.userBranchId = req.user.BranchID;
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStaff,
  requireSameBranch
};