const express = require('express');
const router = express.Router();
const MaternityCenter = require('../models/MaternityCenter');
const Service = require('../models/Service');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/centers
// @desc    Get approved centers with optional search and location filter
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, location } = req.query;
        let query = { status: 'Approved' };

        if (location && location !== 'All Locations') {
            query.location = { $regex: location, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { centerName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const centers = await MaternityCenter.find(query).select('-password').lean();

        // Attach review statistics to each center
        const centersWithRatings = await Promise.all(
            centers.map(async (center) => {
                const reviews = await Review.find({ center: center._id });
                const avgRating = reviews.length > 0
                    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
                    : 4.8; // Default initial rating for seed showcase
                
                return {
                    ...center,
                    rating: avgRating,
                    reviewsCount: reviews.length
                };
            })
        );

        res.json(centersWithRatings);
    } catch (error) {
        console.error('Fetch centers error:', error);
        res.status(500).json({ message: error.message || 'Error fetching centers' });
    }
});

// @route   GET /api/centers/admin/all
// @desc    Get all centers regardless of status (Admin only)
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const centers = await MaternityCenter.find({}).select('-password').sort({ createdAt: -1 });
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/centers/:id
// @desc    Get single center by ID with its services & reviews
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const center = await MaternityCenter.findById(req.params.id).select('-password').lean();
        if (!center) {
            return res.status(404).json({ message: 'Maternity center not found' });
        }

        const services = await Service.find({ center: center._id });
        const reviews = await Review.find({ center: center._id }).populate('user', 'name');

        const avgRating = reviews.length > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : 4.9;

        res.json({
            ...center,
            rating: avgRating,
            reviewsCount: reviews.length,
            services,
            reviews
        });
    } catch (error) {
        console.error('Fetch center detail error:', error);
        res.status(500).json({ message: error.message || 'Error fetching center details' });
    }
});

// @route   PUT /api/centers/:id/status
// @desc    Approve or reject a maternity center (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const center = await MaternityCenter.findById(req.params.id);
        if (!center) {
            return res.status(404).json({ message: 'Maternity center not found' });
        }

        center.status = status;
        await center.save();

        res.json({ message: `Center status updated to ${status}`, center });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/centers/:id
// @desc    Update maternity center profile
// @access  Private (Provider / Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const center = await MaternityCenter.findById(req.params.id);
        if (!center) {
            return res.status(404).json({ message: 'Maternity center not found' });
        }

        if (req.user.role !== 'admin' && center.email !== req.user.email) {
            return res.status(403).json({ message: 'Not authorized to update this center profile' });
        }

        const { centerName, phone, address, location, description } = req.body;
        if (centerName) center.centerName = centerName;
        if (phone) center.phone = phone;
        if (address) center.address = address;
        if (location) center.location = location;
        if (description) center.description = description;

        await center.save();
        res.json(center);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/centers
// @desc    Add a new maternity center (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { centerName, ownerName, email, password, phone, address, location, description, status } = req.body;

        if (!centerName || !ownerName || !email || !phone || !address || !location) {
            return res.status(400).json({ message: 'Center Name, Owner Name, Email, Phone, Address, and Location are required' });
        }

        const existingCenter = await MaternityCenter.findOne({ email });
        if (existingCenter) {
            return res.status(400).json({ message: 'A maternity center with this email already exists' });
        }

        const rawPassword = password || 'provider123';

        // Create the maternity center
        const center = await MaternityCenter.create({
            centerName,
            ownerName,
            email,
            password: rawPassword,
            phone,
            address,
            location,
            description: description || 'Certified maternity care center.',
            status: status || 'Approved'
        });

        // Ensure a provider user account exists so the provider can log in
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            await User.create({
                name: ownerName,
                email,
                password: rawPassword,
                phone,
                role: 'provider'
            });
        }

        res.status(201).json({
            message: 'Maternity center created successfully',
            center
        });
    } catch (error) {
        console.error('Create center error:', error);
        res.status(500).json({ message: error.message || 'Error creating maternity center' });
    }
});

// @route   DELETE /api/centers/:id
// @desc    Delete a maternity center (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const center = await MaternityCenter.findById(req.params.id);
        if (!center) {
            return res.status(404).json({ message: 'Maternity center not found' });
        }

        // Clean up associated services
        await Service.deleteMany({ center: center._id });
        await MaternityCenter.findByIdAndDelete(req.params.id);

        res.json({ message: 'Maternity center removed successfully' });
    } catch (error) {
        console.error('Delete center error:', error);
        res.status(500).json({ message: error.message || 'Error deleting maternity center' });
    }
});

module.exports = router;
