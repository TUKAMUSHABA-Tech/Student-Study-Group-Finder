const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ucu_secret_key_jwt_2026_super_secure_token_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register a new student account
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, programme, year_of_study } = req.body;

    // Validate required fields
    if (!full_name || !email || !password || !programme) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, and programme of study.'
      });
    }

    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Default role for new registrations is 'student'
    const role = 'student';
    const year = parseInt(year_of_study, 10) || 1;

    const result = await db.query(
      'INSERT INTO users (full_name, email, password, programme, year_of_study, role) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name.trim(), email.trim().toLowerCase(), hashedPassword, programme.trim(), year, role]
    );

    const newUserId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: newUserId, email: email.trim().toLowerCase(), role, full_name: full_name.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      token,
      user: {
        id: newUserId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        programme: programme.trim(),
        year_of_study: year,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during student registration.'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Lookup user by email
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        programme: user.programme,
        year_of_study: user.year_of_study,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

// Get current logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, full_name, email, programme, year_of_study, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

// Update personal student profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, programme, year_of_study } = req.body;

    if (!full_name || !programme) {
      return res.status(400).json({ success: false, message: 'Full name and programme are required.' });
    }

    const year = parseInt(year_of_study, 10) || 1;

    await db.query(
      'UPDATE users SET full_name = ?, programme = ?, year_of_study = ? WHERE id = ?',
      [full_name.trim(), programme.trim(), year, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: req.user.id,
        full_name: full_name.trim(),
        programme: programme.trim(),
        year_of_study: year
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};
