require('dotenv').config();
const unipayconnect = require('unipayconnect');
const StripeProvider = require('@unipayconnect/core/gateways/stripe');
const PayPalProvider = require('@unipayconnect/core/gateways/paypal');
const RazorPayProvider = require('@unipayconnect/core/gateways/razorpay');

console.log("unipayconnect", JSON.stringify(unipayconnect, null, 2));
console.log("Stripe", JSON.stringify(StripeProvider, null, 2));
console.log("Paypal", JSON.stringify(PayPalProvider, null, 2));
console.log("Razorpay", JSON.stringify(RazorPayProvider, null, 2));

// const stripe = unipayconnect.register('stripe', new StripeProvider(process.env.REACT_APP_STRIPE_SECRET_KEY));
// const paypal = unipayconnect.register('paypal', new PayPalProvider(process.env.REACT_APP_PAYPAL_CLIENT_SECRET));
// const razorpay = unipayconnect.register('razorpay', new RazorPayProvider({
//     key_id: process.env.REACT_APP_RAZORPAY_KEY_ID,
//     key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
// }));

// async function createSession() {
//     try {
//         const session = await unipayconnect.createCheckoutSession({
//             providers: ['razorpay', 'paypal', 'stripe'],
//             price: 250,
//             currency: 'USD',
//             products: [
//                 {
//                     name: "Nike Tshirt",
//                     price: 50,
//                     quantity: 1
//                 },
//                 {
//                     name: "Puma shoes",
//                     price: 100,
//                     quantity: 2
//                 }
//             ]
//         });
//         console.log('Checkout session created:', JSON.stringify(session, null, 2));

//         // const result = await unipayconnect.capturePayment({
//         //     providerName: "paypal",
//         //     paymentId: "8LU87492HJ7438505",
//         //     amount: 100
//         // })

//         // const result2 = await unipayconnect.verifyWebhookPayload('paypal',
//         //     JSON.stringify({
//         //         id: "8LU87492HJ7438505",
//         //         status: "CREATED",
//         //         links: [
//         //             {
//         //                 href: "https://api.sandbox.paypal.com/v2/checkout/orders/8LU87492HJ7438505",
//         //                 rel: "self",
//         //                 method: "GET"
//         //             },
//         //             {
//         //                 href: "https://www.sandbox.paypal.com/checkoutnow?token=8LU87492HJ7438505",
//         //                 rel: "approve",
//         //                 method: "GET"
//         //             },
//         //             {
//         //                 href: "https://api.sandbox.paypal.com/v2/checkout/orders/8LU87492HJ7438505",
//         //                 rel: "update",
//         //                 method: "PATCH"
//         //             },
//         //             {
//         //                 href: "https://api.sandbox.paypal.com/v2/checkout/orders/8LU87492HJ7438505/capture",
//         //                 rel: "capture",
//         //                 method: "POST"
//         //             }
//         //         ]
//         //     }),
//         //     'your-webhook-signing-secret',
//         //     't=<timestamp>,v1=<signature>' // Pass the actual Stripe signature header from the webhook request
//         // );

//     } catch (error) {
//         console.error('Error creating checkout session:', error);
//     }
// }

// createSession(); 