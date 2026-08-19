const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const MaternityCenter = require('../models/MaternityCenter');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/reviews/center/:centerId
// @desc    Get all reviews for a center
// @access  Public
router.get('/center/:centerId', async (req, res) => {
    try {
        const reviews = await Review.find({ center: req.params.centerId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/reviews
// @desc    Add a review for a center
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { centerId, rating, comment } = req.body;

        if (!centerId || !rating) {
            return res.status(400).json({ message: 'centerId and rating are required' });
        }

        const center = await MaternityCenter.findById(centerId);
        if (!center) {
            return res.status(404).json({ message: 'Maternity center not found' });
        }

        const review = await Review.create({
            user: req.user._id,
            center: centerId,
            rating: Number(rating),
            comment: comment || ''
        });

        const populatedReview = await Review.findById(review._id).populate('user', 'name');

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ message: error.message || 'Error submitting review' });
    }
});

module.exports = router;
