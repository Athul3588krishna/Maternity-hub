const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/bookings
// @desc    Create a new appointment booking & record payment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { centerId, serviceId, bookingDate, paymentMethod } = req.body;

        if (!centerId || !serviceId || !bookingDate) {
            return res.status(400).json({ message: 'centerId, serviceId, and bookingDate are required' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            center: centerId,
            service: serviceId,
            bookingDate: new Date(bookingDate),
            bookingStatus: 'Pending'
        });

        // Automatically create a payment entry for the booking
        const payment = await Payment.create({
            booking: booking._id,
            amount: service.price,
            paymentMethod: paymentMethod || 'Online',
            paymentStatus: 'Paid'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('center', 'centerName address location phone email')
            .populate('service', 'serviceName price duration description')
            .populate('user', 'name email phone');

        res.status(201).json({
            booking: populatedBooking,
            payment
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: error.message || 'Error creating booking' });
    }
});

// @route   GET /api/bookings/my
// @desc    Get logged-in user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('center', 'centerName address location phone email')
            .populate('service', 'serviceName price duration description')
            .sort({ createdAt: -1 })
            .lean();

        // Attach payment status
        const bookingsWithPayment = await Promise.all(
            bookings.map(async (b) => {
                const payment = await Payment.findOne({ booking: b._id });
                return {
                    ...b,
                    paymentStatus: payment ? payment.paymentStatus : 'Paid'
                };
            })
        );

        res.json(bookingsWithPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/center/:centerId
// @desc    Get bookings for a specific center (for Provider)
// @access  Private
router.get('/center/:centerId', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ center: req.params.centerId })
            .populate('user', 'name email phone')
            .populate('service', 'serviceName price duration')
            .sort({ createdAt: -1 })
            .lean();

        const bookingsWithPayment = await Promise.all(
            bookings.map(async (b) => {
                const payment = await Payment.findOne({ booking: b._id });
                return {
                    ...b,
                    paymentStatus: payment ? payment.paymentStatus : 'Paid'
                };
            })
        );

        res.json(bookingsWithPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/all
// @desc    Get all bookings across the platform (Admin only)
// @access  Private/Admin
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('center', 'centerName')
            .populate('user', 'name email phone')
            .populate('service', 'serviceName price')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Accepted, Rejected, Completed)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { bookingStatus } = req.body;
        if (!['Pending', 'Accepted', 'Rejected', 'Completed'].includes(bookingStatus)) {
            return res.status(400).json({ message: 'Invalid booking status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.bookingStatus = bookingStatus;
        await booking.save();

        res.json({ message: `Booking status updated to ${bookingStatus}`, booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
