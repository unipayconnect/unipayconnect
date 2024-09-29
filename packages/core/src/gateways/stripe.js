const { handleError, CustomError } = require('../common/errorHandler');
const { info, error } = require('../common/logger');
const { stripe } = require("../config");
const stripeInstance = require('stripe')(stripe.secretKey);

class StripeProvider {
    constructor(secretKey) {
        this.stripeInstance = stripeInstance;
    }
    async createCheckoutSession({ price, currency }) {
        try {
            const session = await stripeInstance.checkout.sessions.create({
                payment_method_types: ['card'],//to do
                line_items: [{
                    price_data: {
                        currency,
                        product_data: { name: 'Sample Product' },//to do
                        unit_amount: price,
                    },
                    quantity: 1,//to do
                }],
                mode: 'payment',
                // payment_intent_data: {
                //     capture_method: 'manual',//to capture paymentIntent manually
                // },
                success_url: 'https://your-domain.com/success',//to do
                cancel_url: 'https://your-domain.com/cancel',//to do
            });
            info('Checkout session created successfully');
            return session;
        } catch (err) {
            console.error('Stripe Checkout Session Error:', err);
            error('Failed to create Stripe checkout session', 500);
        }
    }
    async capturePayment(paymentId) {
        try {
            const paymentIntent = await stripeInstance.paymentIntents.capture(paymentId);
            return paymentIntent;
        } catch (err) {
            console.error('Stripe Payment Capture Error:', err);
            throw new CustomError('Failed to capture Stripe payment', 500);
        }
    }
    async verifyWebhookPayload(payload, signature) {
        try {
            const event = await stripeInstance.webhooks.constructEvent(payload, signature, stripe.webhookSecret);
            return event;
        } catch (err) {
            console.error('Stripe Webhook Verification Error:', err);
            throw new CustomError('Failed to verify Stripe webhook payload', 500);
        }
    }
};

module.exports = StripeProvider;
