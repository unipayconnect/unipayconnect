const { handleError, CustomError } = require('../common/errorHandler');
const { info, error } = require('../common/logger');
const { stripe } = require("../config");
const stripeInstance = require('stripe')(stripe.secretKey);

class StripeProvider {
    constructor(secretKey) {
        this.stripeInstance = require('stripe')(secretKey);
    }
    async createCheckoutSession({ price, currency, name, email, products }) {
        try {
            const session = await this.stripeInstance.checkout.sessions.create({
                payment_method_types: ['card'],//to do
                mode: 'payment',
                line_items: products && products.length > 0 ? products.map(product => ({
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: product.name,
                            description: product.description,
                        },
                        unit_amount: product.price * 100, // Stripe requires the price in cents
                    },
                    quantity: product.quantity,
                })) : [{
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: "Sample Product",
                            description: "Sample description for fallback product",
                        },
                        unit_amount: 100,
                    },
                    quantity: 1,
                }], // Provide sample array if no products are provided
                // payment_intent_data: {
                //     capture_method: 'manual',//to capture paymentIntent manually
                // },
                customer_email: email,
                customer_name: name,
                success_url: `${process.env.REACT_APP_API_URL}/success`,
                cancel_url: `${process.env.REACT_APP_API_URL}/cancel`,
            });

            const amount = session.amount_total;
            const orderId = session.id;
            const url = session.url;

            info('Checkout session created successfully');
            return { session, amount, orderId, url };
        } catch (err) {
            console.error('Stripe Checkout Session Error:', err);
            error('Failed to create Stripe checkout session', 500);
        }
    }
    async capturePayment(paymentId) {
        try {
            const paymentIntent = await this.stripeInstance.paymentIntents.capture(paymentId);
            return paymentIntent;
        } catch (err) {
            console.error('Stripe Payment Capture Error:', err);
            throw new CustomError('Failed to capture Stripe payment', 500);
        }
    }
    async verifyWebhookPayload(payload, signature) {
        try {
            const event = await this.stripeInstance.webhooks.constructEvent(payload, signature, stripe.webhookSecret);
            return event;
        } catch (err) {
            console.error('Stripe Webhook Verification Error:', err);
            throw new CustomError('Failed to verify Stripe webhook payload', 500);
        }
    }
};

module.exports = StripeProvider;
