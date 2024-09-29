const paypalInstance = require('@paypal/checkout-server-sdk');
const crypto = require("crypto");
const { CustomError, handleError } = require('../common/errorHandler');
const { info, error } = require('../common/logger');
const { paypal } = require("../config");

const Environment = paypalInstance.nodeenv === 'production'
    ? paypalInstance.core.LiveEnvironment
    : paypalInstance.core.SandboxEnvironment;

const client = new paypalInstance.core.PayPalHttpClient(new Environment(paypal.clientId, paypal.clientSecret));

class PayPalProvider {
    constructor() {
        this.paypalInstance = paypalInstance;
    }
    async createCheckoutSession({ price, currency }) {
        try {
            const request = new paypalInstance.orders.OrdersCreateRequest();
            request.prefer('return=representation');
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: price.toString(),
                    },
                }],
            });

            const order = await client.execute(request);
            info('Checkout session created successfully');
            return order.result;
        } catch (err) {
            console.error('PayPal Checkout Session Error:', err);
            error('Failed to create PayPal checkout session', 500);
        }
    }
    async capturePayment(paymentId) {
        try {
            const request = await new paypalInstance.orders.OrdersCaptureRequest(paymentId);
            request.requestBody({});
            const capture = await client.execute(request);
            return capture.result;
        } catch (err) {
            console.error('PayPal Payment Capture Error:', err);
            throw new CustomError('Failed to capture PayPal payment', 500);
        }
    }
    async verifyWebhookPayload(payload, signature) {
        if (!payload || !signature || !paypal.clientId || !paypal.clientSecret) {
            throw new CustomError('Missing required parameters for PayPal webhook verification', 400);
        }

        try {
            // Step 1: Reconstruct the expected signature
            const expectedSignature = await crypto
                .createHmac('sha256', paypal.clientSecret)
                .update(JSON.stringify(payload))
                .digest('base64');

            // Step 2: Compare the expected signature with the provided signature
            const isVerified = expectedSignature === signature;

            if (!isVerified) {
                throw new CustomError('Invalid PayPal webhook signature', 400);
            }

            // Step 3: Return the payload if the verification succeeds
            return payload;
        } catch (err) {
            console.error('PayPal webhook verification failed:', err);
            throw new CustomError('PayPal webhook verification failed', 500);
        }
    }
};

module.exports = PayPalProvider;
