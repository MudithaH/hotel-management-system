//Handles login, logout, and user profile operations

const { findOne } = require('../config/db');
const { comparePassword, generateToken, formatResponse } = require('../utils/helpers');

// Staff login with email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required', null, 400)
      );
    }

    // Find correct staff member with designation and branch info
    const staffQuery = `
      SELECT s.StaffID, s.Name, s.Email, s.HashedPassword, s.BranchID, s.DesignationID,
             d.Designation as Role, d.Salary,
             hb.Address as BranchAddress, hb.City as BranchCity
      FROM staff s
      JOIN designation d ON s.DesignationID = d.DesignationID
      JOIN hotelBranch hb ON s.BranchID = hb.BranchID
      WHERE s.Email = ?
    `;

    const staffResult = await findOne(staffQuery, [email]);

    if (!staffResult.success || !staffResult.data) {
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password', null, 401)
      );
    }

    const staff = staffResult.data;

    // Verify password
    const isPasswordValid = await comparePassword(password, staff.HashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password', null, 401)
      );
    }

    // Generate JWT token
    const token = generateToken({
      staffId: staff.StaffID,
      email: staff.Email,
      role: staff.DesignationID,
      branchId: staff.BranchID
    });

    // Remove sensitive data from response
    const { HashedPassword, ...staffData } = staff;

    res.json(formatResponse(true, 'Login successful', {
      user: staffData,
      token,
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }));

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      formatResponse(false, 'Login failed', null, 500)
    );
  }
};

// Get current staff profile 
const getProfile = async (req, res) => {
  try {
    // User info is available from auth middleware
    const user = req.user;

    res.json(formatResponse(true, 'Profile retrieved successfully', { user }));

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve profile', null, 500)
    );
  }
};


// Logout
const logout = async (req, res) => {
  try {
    res.json(formatResponse(true, 'Logged out successfully'));

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(
      formatResponse(false, 'Logout failed', null, 500)
    );
  }
};

module.exports = {
  login,
  getProfile,
  logout
};