const {
    ApiError,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
    WebhookEvent,
} = require('@paypal/paypal-server-sdk');
const crypto = require("crypto");
const { CustomError, handleError } = require('../common/errorHandler');
const { info, error } = require('../common/logger');
const { paypal } = require("../config");

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: paypal.clientId,
        oAuthClientSecret: paypal.clientSecret,
    },
    timeout: 0,
    environment: paypal.nodeenv === 'sandbox' ? Environment.Sandbox : Environment.Production,
    // logging: {
    //     logLevel: LogLevel.Info,
    //     logRequest: { logBody: true },
    //     logResponse: { logHeaders: true },
    // },
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

class PayPalProvider {
    constructor() {
        this.client = client;
    }
    async createCheckoutSession({ price, currency, name, email, products }) {

        const requestBody = {
            intent: "CAPTURE",
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: currency, // Fixed typo to 'currencyCode'
                        value: price.toFixed(2), // Total price in two decimal places
                        breakdown: {
                            itemTotal: {
                                currencyCode: currency, // Fixed typo to 'currencyCode'
                                value: price.toFixed(2), // Total of product prices
                            },
                        },
                    },
                    items: products?.map(product => ({
                        name: product.name,
                        unitAmount: {
                            currencyCode: currency, // Fixed typo to 'currencyCode'
                            value: product.price.toFixed(2), // Unit price
                        },
                        quantity: product.quantity.toString(), // Quantity
                    })),
                },
            ],
            applicationContext: {
                returnUrl: `${process.env.REACT_APP_API_URL}/success`,
                cancelUrl: `${process.env.REACT_APP_API_URL}/cancel`,
                // brandName: "UnipayConnect",
                locale: "en-US",
                shippingPreference: "NO_SHIPPING", // Set if no shipping is required
                userAction: "PAY_NOW", // Prompt user to pay immediately
            },
            payer: {
                name: {
                    given_name: name.split(' ')[0], // Assuming first name is provided
                    surname: name.split(' ')[1] || "", // Assuming last name is optional
                },
                email_address: email, // Prefill the email address
            },
        };

        try {
            // const request = OrdersCreateRequest();
            // request.prefer('return=representation');
            // request.requestBody({
            //     intent: 'CAPTURE',
            //     purchase_units: [{
            //         amount: {
            //             currency_code: currency,
            //             value: price.toString(),// The total order value
            //             breakdown: {
            //                 item_total: {
            //                     currency_code: currency,
            //                     value: price.toString(), // Sum of all product prices
            //                 },
            //             },
            //         },
            //         items: products?.map(product => ({
            //             name: product.name,
            //             unit_amount: {
            //                 currency_code: currency,
            //                 value: product.price.toFixed(2), // Price per unit (must be in 2 decimal places)
            //             },
            //             quantity: product.quantity.toString(), // Quantity as string
            //         })),
            //     }],
            // });

            // const order = await this.client.execute(request);

            const { body, ...httpResponse } = await ordersController.ordersCreate({
                body: requestBody,
                prefer: "return=minimal", // Minimal return type
            });

            const jsonResponse = JSON.parse(body);

            const amount = price.toFixed(2);
            const orderId = jsonResponse.id;
            const url = jsonResponse.links?.find(link => link.rel === 'approve').href;

            info('Checkout session created successfully');
            return { session: jsonResponse, amount, orderId, url };
        } catch (err) {
            if (err instanceof ApiError) {
                console.error('PayPal API Error:', err);
                error(`PayPal Error: ${err.message}`, 500);
            } else {
                console.error('PayPal Checkout Session Error:', err);
                error('Failed to create PayPal checkout session', 500);
            }
        }
    }
    async capturePayment(paymentId) {
        try {
            // const request = await OrdersCaptureRequest(paymentId);
            // request.requestBody({});
            // const capture = await this.client.execute(request);

            if (!paymentId || typeof paymentId !== 'string') {
                error("Invalid paymentId provided for capturePayment");
                throw new CustomError("Invalid paymentId: Expected a non-empty string", 400);
            }
            const collect = {
                id: paymentId,
                prefer: "return=minimal",
            };

            const { body, ...httpResponse } = await ordersController.ordersCapture(collect);

            const captureResponse = JSON.parse(body);

            if (httpResponse.statusCode !== 201) {
                throw new CustomError('Failed to capture PayPal payment', capture.statusCode);
            }
            info('Payment captured successfully');
            return captureResponse;
        } catch (err) {
            if (err instanceof ApiError) {
                console.error('PayPal API Error during capture:', err);
                throw new CustomError(`PayPal Error: ${err.message}`, 500);
            } else {
                console.error('PayPal Payment Capture Error:', err);
                throw new CustomError('Failed to capture PayPal payment', 500);
            }
        }
    }
    async verifyWebhookPayload(payload, signature) {
        if (!payload || !signature || !paypal.clientId || !paypal.clientSecret) {
            throw new CustomError('Missing required parameters for PayPal webhook verification', 400);
        }

        try {
            // Step 1: Reconstruct the expected signature
            const expectedSignature = await crypto
                .createHmac('sha256', paypal.webhookId)
                .update(JSON.stringify(payload))
                .digest('base64');

            // Step 2: Compare the expected signature with the provided signature
            const isVerified = expectedSignature === signature;

            // Step 1: Retrieve the webhook ID from your PayPal application settings
            // const webhookId = paypal.webhookId; // PayPal Webhook ID from config

            // if (!webhookId) {
            //     throw new CustomError('Missing PayPal Webhook ID for verification', 500);
            // }

            // Step 2: Verify the webhook signature using the `WebhookEvent.verify` function
            // const isVerified = await WebhookEvent.verify(
            //     this.client,
            //     {
            //         'paypal-transmission-id': transmissionId,
            //         'paypal-transmission-time': transmissionTime,
            //         'paypal-transmission-sig': signature,
            //         'paypal-cert-url': certUrl,
            //         'paypal-auth-algo': authAlgo,
            //     }, // Headers containing the signature and transmission details
            //     payload,
            //     webhookId // PayPal webhook ID to verify against
            // );

            // Step 3: Check if the signature is valid
            if (!isVerified) {
                throw new CustomError('Invalid PayPal webhook signature', 400);
            }

            // Step 4: Return the verified payload if the verification succeeds
            return payload;
        } catch (err) {
            console.error('PayPal webhook verification failed:', err);
            throw new CustomError('PayPal webhook verification failed', 500);
        }
    }
};

module.exports = PayPalProvider;
