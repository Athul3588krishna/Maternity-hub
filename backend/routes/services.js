const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const MaternityCenter = require('../models/MaternityCenter');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/services/center/:centerId
// @desc    Get all services for a specific maternity center
// @access  Public
router.get('/center/:centerId', async (req, res) => {
    try {
        const services = await Service.find({ center: req.params.centerId });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/services
// @desc    Add a service to a center
// @access  Private (Provider / Admin)
router.post('/', protect, async (req, res) => {
    try {
        const { centerId, serviceName, description, price, duration } = req.body;

        if (!centerId || !serviceName || !price) {
            return res.status(400).json({ message: 'centerId, serviceName, and price are required' });
        }

        const center = await MaternityCenter.findById(centerId);
        if (!center) {
            return res.status(404).json({ message: 'Maternity center not found' });
        }

        if (req.user.role !== 'admin' && center.email !== req.user.email) {
            return res.status(403).json({ message: 'Not authorized to add services for this center' });
        }

        const service = await Service.create({
            center: centerId,
            serviceName,
            description,
            price: Number(price),
            duration: duration || '60 mins',
            availability: true
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ message: error.message || 'Failed to create service' });
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private (Provider / Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const center = await MaternityCenter.findById(service.center);
        if (req.user.role !== 'admin' && (!center || center.email !== req.user.email)) {
            return res.status(403).json({ message: 'Not authorized to delete services for this center' });
        }

        await service.deleteOne();
        res.json({ message: 'Service removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
