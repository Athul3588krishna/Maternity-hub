const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const MaternityCenter = require('./models/MaternityCenter');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Payment = require('./models/Payment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/maternity-hub';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await MaternityCenter.deleteMany({});
        await Service.deleteMany({});
        await Booking.deleteMany({});
        await Review.deleteMany({});
        await Payment.deleteMany({});

        console.log('Cleared existing database records.');

        // 1. Create Users
        const adminUser = await User.create({
            name: 'Platform Admin',
            email: 'admin@maternityhub.com',
            password: 'admin123',
            phone: '+1 (800) 555-0199',
            role: 'admin'
        });

        const providerUser = await User.create({
            name: 'Dr. Sarah Jenkins',
            email: 'provider@blossom.com',
            password: 'provider123',
            phone: '+1 (415) 555-0192',
            role: 'admin'
        });

        const patientUser = await User.create({
            name: 'Emily Watson',
            email: 'patient@gmail.com',
            password: 'patient123',
            phone: '+1 (555) 234-5678',
            role: 'user'
        });

        console.log('Created admin, provider, and patient users.');

        // 2. Create Maternity Centers
        const centersData = [
            {
                centerName: 'Blossom Maternity Center',
                ownerName: 'Dr. Sarah Jenkins',
                email: 'provider@blossom.com',
                password: 'provider123',
                phone: '+1 (415) 555-0192',
                address: '450 Healthcare Ave, Suite 200',
                location: 'San Francisco, CA',
                description: 'Luxury natural birth suites, 24/7 obstetricians, water birth tubs, and postpartum confinement care.',
                status: 'Approved'
            },
            {
                centerName: 'St. Jude Postnatal Care',
                ownerName: 'Dr. Robert Vance',
                email: 'care@stjude-infant.care',
                password: 'password123',
                phone: '+1 (312) 555-0921',
                address: '1200 Hope Blvd',
                location: 'Chicago, IL',
                description: 'Level III NICU, comprehensive high-risk pregnancy management, fetal cardiology & ultrasound.',
                status: 'Approved'
            },
            {
                centerName: 'Serenity Maternity Center',
                ownerName: 'Elena Rostova',
                email: 'hello@serenityhaven.com',
                password: 'password123',
                phone: '+1 (512) 555-7732',
                address: '44 Wellness Way',
                location: 'Austin, TX',
                description: 'Postpartum nursing retreat, lactation consultants, maternal mental wellness counseling, newborn nutrition.',
                status: 'Approved'
            },
            {
                centerName: 'Grace Postnatal Care',
                ownerName: 'Dr. Michael Chen',
                email: 'info@gracefamily.nyc',
                password: 'password123',
                phone: '+1 (212) 555-8891',
                address: '888 Madison Ave',
                location: 'New York, NY',
                description: 'Comprehensive prenatal diagnostics, painless epidural labor suites, and 24/7 emergency OB/GYN response.',
                status: 'Approved'
            },
            {
                centerName: 'Lumina Maternity Center',
                ownerName: 'Sophia Martinez',
                email: 'contact@luminawomens.com',
                password: 'password123',
                phone: '+1 (310) 555-1200',
                address: '7700 Sunset Blvd',
                location: 'Los Angeles, CA',
                description: 'Premium maternal care focusing on holistic wellness, customized birth plans, and advanced prenatal genetics.',
                status: 'Approved'
            },
            {
                centerName: 'Nurture Postnatal Care',
                ownerName: 'Rachel Green',
                email: 'hello@nurturecare.com',
                password: 'password123',
                phone: '+1 (206) 555-4309',
                address: '204 Pine St',
                location: 'Seattle, WA',
                description: 'Cozy, home-like birthing environment with highly experienced midwives and comprehensive doula support.',
                status: 'Approved'
            },
            {
                centerName: 'Hope Haven Birthing Suites',
                ownerName: 'Dr. James Wilson',
                email: 'contact@hopehaven.org',
                password: 'password123',
                phone: '+1 (404) 555-3321',
                address: '500 Peachtree St',
                location: 'Atlanta, GA',
                description: 'Specialized fetal medicine, water birth delivery, and newborn intensive care unit.',
                status: 'Pending'
            }
        ];

        const createdCenters = await MaternityCenter.create(centersData);
        console.log(`Created ${createdCenters.length} maternity centers.`);

        // 3. Create Services for Blossom Maternity Center & others
        const blossomCenter = createdCenters[0];
        const servicesData = [
            {
                center: blossomCenter._id,
                serviceName: 'Postnatal Lactation & Newborn Nursing',
                description: 'Certified lactation nurse consultation, infant attachment guidance.',
                price: 3500,
                duration: '60 mins'
            },
            {
                center: blossomCenter._id,
                serviceName: 'Postpartum Recovery & Wellness Care',
                description: 'Physical recovery assistance, mental wellness check, and nutrition plan.',
                price: 5000,
                duration: '90 mins'
            },
            {
                center: blossomCenter._id,
                serviceName: 'Prenatal Health & Sonography Package',
                description: 'Full fetal anatomy scan, maternal health assessment, and ultrasound recording.',
                price: 2500,
                duration: '45 mins'
            },
            {
                center: blossomCenter._id,
                serviceName: 'Luxury Water Birth Delivery Suite',
                description: 'Private birthing tub, personal midwife, obstetrician on standby, and care kit.',
                price: 45000,
                duration: '24 Hours Care'
            }
        ];

        // Add default services for all other centers
        for (let i = 1; i < createdCenters.length; i++) {
            const center = createdCenters[i];
            servicesData.push(
                {
                    center: center._id,
                    serviceName: 'Comprehensive Prenatal Consultation',
                    description: 'Full trimester check-up with senior OB/GYN specialist.',
                    price: 3000,
                    duration: '60 mins'
                },
                {
                    center: center._id,
                    serviceName: 'Postnatal Wellness & Newborn Care',
                    description: '24/7 pediatric nurse guidance, umbilical care, lactation counseling.',
                    price: 4500,
                    duration: '90 mins'
                }
            );
        }

        const createdServices = await Service.create(servicesData);
        console.log(`Created ${createdServices.length} maternity services.`);

        // 4. Create Sample Reviews
        await Review.create([
            {
                user: patientUser._id,
                center: blossomCenter._id,
                rating: 5,
                comment: 'The birth suite was extraordinarily peaceful and the nurses were so compassionate!'
            },
            {
                user: patientUser._id,
                center: createdCenters[1]._id,
                rating: 5,
                comment: 'Top-tier care for high-risk pregnancies. We felt safe throughout labor.'
            }
        ]);

        // 5. Create Sample Booking
        const sampleBooking = await Booking.create({
            user: patientUser._id,
            center: blossomCenter._id,
            service: createdServices[0]._id,
            bookingDate: new Date(Date.now() + 86400000 * 3), // 3 days in future
            bookingStatus: 'Accepted'
        });

        await Payment.create({
            booking: sampleBooking._id,
            amount: createdServices[0].price,
            paymentMethod: 'Online',
            paymentStatus: 'Paid'
        });

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
