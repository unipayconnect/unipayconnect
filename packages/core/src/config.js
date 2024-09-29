require('dotenv').config();
const Redis = require('ioredis');

let redisClient = null;

const getRedisClient = () => {
    if (redisClient) {
        if (redisClient.status === 'connecting' || redisClient.status === 'connected') {
            // Return the existing client if it's connecting/connected
            return redisClient;
        } else {
            // Close existing connection and create a new one if the status isn't connecting/connected
            redisClient.disconnect();
        }
    }

    // Initialize Redis client if no existing one
    redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        retryStrategy(times) {
            return Math.min(times * 50, 2000); // Retry with exponential backoff
        }
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    return redisClient;
};

const client = getRedisClient();

module.exports = {
    client,
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        nodeenv: process.env.NODE_ENV,
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    }
};
