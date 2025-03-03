const express = require('express');
const bodyParser = require('body-parser');
const indexRoute = require('../src/routes/index');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const { requestLogger } = require('./utils/elastic-search-logger');
const redisHelper = require('./utils/cache');
const { testRedis } = require('./utils/redisTest');

const app = express();

const build = async () => {
    try {
        // Test Redis connection
        await testRedis();

        // Wait for Redis to be ready (with a timeout)
        const maxWaitTime = 30 * 1000; // 30 seconds
        const startTime = Date.now();

        while (!redisHelper.isConnected()) {
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error('Redis connection timeout exceeded');
            }

            console.log('Waiting for Redis connection...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Middleware
        app.use(bodyParser.json());
        app.use(morgan('combined'));
        app.use(requestLogger);

        // Seeder (Uncomment if needed)
        // try {
        //     await seedUsers();
        //     console.log('Users seeded successfully');
        // } catch (error) {
        //     console.error('Error seeding users', error);
        // }

        // Routes
        app.use('/api', indexRoute);
        app.use('*', (req, res) => res.status(404).json({ error: 'Not found' }));

        console.log('✅ Server initialized');
        return app; // Ensure the app is returned after it's built

    } catch (error) {
        console.error('❌ Error during server initialization:', error);
        process.exit(1); // Stop the process if initialization fails
    }
};

// Ensure the app is built before exporting
const appReady = build();

module.exports = { appReady };
