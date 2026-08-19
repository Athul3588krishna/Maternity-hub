const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MaternityCenter = require('../models/MaternityCenter');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretjwtkey_maternityhub', {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new patient or center provider
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role, centerName, address, location, description } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const userRole = role === 'admin' || role === 'provider' ? role : 'user';

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: userRole
        });

        let centerId = null;
        // If registering as a provider, create the MaternityCenter entity
        if (userRole === 'admin' || userRole === 'provider') {
            try {
                const center = await MaternityCenter.create({
                    centerName: centerName || `${name}'s Maternity Center`,
                    ownerName: name,
                    email,
                    password,
                    phone: phone || '123-456-7890',
                    address: address || '123 Healthcare Way',
                    location: location || 'San Francisco, CA',
                    description: description || 'Certified maternity care center.',
                    status: userRole === 'admin' ? 'Approved' : 'Pending'
                });
                centerId = center._id;
            } catch (centerErr) {
                // Remove orphaned user if center creation fails
                await User.findByIdAndDelete(user._id);
                throw centerErr;
            }
        }

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            centerId,
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            let centerId = null;
            if (user.role === 'admin' || user.role === 'provider') {
                const center = await MaternityCenter.findOne({ email: user.email });
                if (center) centerId = center._id;
            }

            const token = generateToken(user._id, user.role);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                centerId,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get user profile from JWT
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = req.user;
        let centerId = null;
        if (user.role === 'admin' || user.role === 'provider') {
            const center = await MaternityCenter.findOne({ email: user.email });
            if (center) centerId = center._id;
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            centerId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
