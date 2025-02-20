require("dotenv").config();
const unipayconnect = require("unipayconnect-core-service");

const StripeProvider = require("unipayconnect-core-service/src/gateways/stripe");
const PaypalProvider = require("unipayconnect-core-service/src/gateways/paypal");
const RazorpayProvider = require("unipayconnect-core-service/src/gateways/razorpay");


const stripe = unipayconnect.register("stripe", new StripeProvider(process.env.STRIPE_SECRET_KEY));
const razorpay = unipayconnect.register("razorpay", new RazorpayProvider({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}));
const paypal = unipayconnect.register("paypal", new PaypalProvider(process.env.PAYPAL_CLIENT_SECRET));


const createCheckoutSession = async () => {
    const session = await unipayconnect.createCheckoutSession({
        price: 250,
        currency: "USD",
        providers: [
            "stripe",
            "paypal",
            "razorpay"
        ],
        name: "Avanish Porwal",
        email: "avanishporwal01@gmail.com",
        products: [
            {
                name: "Nike Tshirt",
                price: 50,
                quantity: 1
            },
            {
                name: "Puma shoes",
                price: 100,
                quantity: 2
            }
        ]
    });
    console.log(JSON.stringify(session, null, 2));
}

createCheckoutSession();