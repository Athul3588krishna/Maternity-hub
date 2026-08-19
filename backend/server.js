const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/maternity-hub';
mongoose.connect(MONGO_URI).then(() => {
    console.log('MongoDB Connected successfully to:', MONGO_URI);
}).catch(err => {
    console.error('MongoDB Connection Error:', err.message);
});

// Import Routes
const authRoutes = require('./routes/auth');
const centerRoutes = require('./routes/centers');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint for Cloud deployments (Render / Vercel / Railway)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Maternity Hub API is active',
        timestamp: new Date().toISOString(),
        dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to Maternity Hub API' });
});

// Serve frontend static assets in production mode
if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendDist));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(frontendDist, 'index.html'));
    });
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`MaternityHub server running on port ${PORT}`);
});
