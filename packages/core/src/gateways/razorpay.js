const Razorpay = require('razorpay');
const crypto = require('crypto');
const { CustomError } = require('../common/errorHandler');
const { info, error } = require('../common/logger');
const { razorpay } = require("../config");

const razorpayInstance = new Razorpay({
    key_id: razorpay.keyId,
    key_secret: razorpay.keySecret,
})

class RazorPayProvider {
    constructor(keyId, keySecret) {
        this.razorpayInstance = razorpayInstance;
    }
    async createCheckoutSession({ price, currency, name, email, products }) {
        try {
            let adjustedAmount = price * 100;// Razorpay uses smallest currency unit

            // Handle 3-decimal currencies (KWD, BHD, JOD, OMR, TND)
            const threeDecimalCurrencies = ['KWD', 'BHD', 'JOD', 'OMR', 'TND'];
            if (threeDecimalCurrencies.includes(currency.toUpperCase())) {
                adjustedAmount = Math.round(price * 1000 / 10) * 10; // Ensure last digit is 0
            }

            const options = {
                amount: adjustedAmount,
                currency,
                receipt: `receipt_${Date.now()}`,
                notes: {
                    name: name, // Add customer name in notes
                    email: email, // Add customer email in notes
                },
            };

            const order = await razorpayInstance.orders.create(options);

            const amount = order.amount;
            const orderId = order.id;
            const url = order.receipt;

            info('Checkout session created successfully');
            return { session: order, amount, orderId, url };
        } catch (err) {
            console.error('RazorPay Create Session Error:', err);
            error('Failed to create RazorPay checkout session', 500);
        }
    }
    async capturePayment(paymentId, amount, currency) {
        try {
            const payment = await razorpayInstance.payments.capture(paymentId, amount * 100, currency);
            return payment;
        } catch (err) {
            console.error('Razorpay Payment Capture Error:', err);
            throw new CustomError('Failed to capture Razorpay payment', 500);
        }
    }
    async verifyWebhookPayload(payload, signature) {
        try {
            const expectedSignature = await crypto.createHmac('sha256', razorpay.webhookSecret)
                .update(payload)
                .digest('hex');
            if (expectedSignature !== signature) {
                throw new CustomError('Invalid Razorpay webhook signature');
            }
            const event = req.body.event;
            if (event === 'payment.captured') {
                console.log(`Payment captured: ${req.body.payload.payment.entity.amount}`);
            }
            return JSON.parse(payload);
        } catch (err) {
            console.error('Razorpay Webhook Payload Error:', err);
            throw new CustomError('Failed to verify webhook payload', 500);
        }
    }
};

module.exports = RazorPayProvider;
