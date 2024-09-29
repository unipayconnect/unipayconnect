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
    async createCheckoutSession({ price, currency }) {
        try {
            const options = {
                amount: price * 100, // Razorpay uses smallest currency unit
                currency,
                receipt: `receipt_${Date.now()}`,
            };
            const order = await razorpayInstance.orders.create(options);
            info('Checkout session created successfully');
            return order;
        } catch (err) {
            console.error('RazorPay Create Session Error:', err);
            error('Failed to create RazorPay checkout session', 500);
        }
    }
    async capturePayment(paymentId, amount) {
        try {
            const payment = razorpayInstance.payments.capture(paymentId, amount);
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
            return JSON.parse(payload);
        } catch (err) {
            console.error('Razorpay Webhook Payload Error:', err);
            throw new CustomError('Failed to verify webhook payload', 500);
        }
    }
};

module.exports = RazorPayProvider;
