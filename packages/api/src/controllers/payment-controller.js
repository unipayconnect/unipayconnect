const StripeProvider = require("@core/gateways/stripe");
const PayPalProvider = require("@core/gateways/paypal");
const RazorPayProvider = require("@core/gateways/razorpay");
const unipayconnect = require('@core');
const { handleError, CustomError } = require('@core/common/errorHandler');
const { info, error } = require('@core/common/logger');
const util = require("util");

const handleGetProvider = async (req, res) => {
    try {
        const { providerName } = req.params;

        if (!providerName) {
            throw new CustomError('Provider name is required', 400);
        }

        const provider = util.inspect(await unipayconnect.getProvider(providerName.toLowerCase()), { showHidden: false, depth: null });
        // const provider = await unipayconnect.getProvider(providerName.toLowerCase());

        if (!provider) {
            throw new CustomError(`Provider ${providerName} not found`, 404);
        }

        info(`Provider ${providerName} retrieved successfully`);
        return res.status(200).json({ providerName, provider });
    } catch (err) {
        handleError(err, res);
        error('Failed to fetch provider', err);
    }
}

const handleFetchCheckoutSession = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            throw new CustomError('Token is required', 400);
        }
        const decoded = await unipayconnect.initPayment(token);
        info(`Session data retrieved successfully`);
        return res.status(200).json({ name: decoded.name, email: decoded.email, products: decoded.products, sessions: decoded.sessions });
    } catch (err) {
        handleError(err, res);
        error('Failed to fetch session data', err);
    }
}

const handleGetAllProviders = async (req, res) => {
    try {
        const providers = await unipayconnect.getAllProviders();

        if (!providers) {
            throw new CustomError(`Providers not found`, 404);
        }

        info(`Providers retrieved successfully`);
        return res.status(200).json({ success: true, providers });
    } catch (err) {
        handleError(err, res);
        error('Failed to fetch registered providers', err);
    }
};

const handleRegisterAllProviders = async (req, res) => {
    try {
        const { providers } = req.body;

        for (let provider of providers) {
            if (!provider.providerName || !provider.apiKey) {
                throw new CustomError('Provider name and API key for registering all providers are necessary', 400);
            }

            let providerInstance;

            switch (provider.providerName.toLowerCase()) {
                case 'stripe':
                    providerInstance = new StripeProvider(provider.apiKey);
                    break;
                case 'paypal':
                    providerInstance = new PayPalProvider(provider.apiKey);
                    break;
                case 'razorpay':
                    providerInstance = new RazorPayProvider(provider.apiKey);
                    break;
                default:
                    throw new CustomError('Invalid provider name', 400);
            }

            unipayconnect.register(provider.providerName.toLowerCase(), providerInstance);
        }

        info(`Providers regitered successfully`);
        return res.status(201).json({ message: 'Providers registered successfully.', providers });
    } catch (err) {
        handleError(err, res);
        error('Failed to register providers', err);
    }
}

const handleRegisterProvider = async (req, res) => {
    try {
        const { providerName, apiKey } = req.body;

        if (!providerName || !apiKey) {
            throw new CustomError('Provider name and API key are required', 400);
        }

        let providerInstance;

        switch (providerName.toLowerCase()) {
            case 'stripe':
                providerInstance = new StripeProvider(apiKey);
                break;
            case 'paypal':
                providerInstance = new PayPalProvider(apiKey);
                break;
            case 'razorpay':
                providerInstance = new RazorPayProvider(apiKey);
                break;
            // Add cases for other providers as needed
            default:
                throw new CustomError('Invalid provider name', 400);
        }

        unipayconnect.register(providerName.toLowerCase(), providerInstance);

        info(`Provider ${providerName} registered successfully`);
        return res.status(201).json({ message: `${providerName} registered successfully.` });
    } catch (err) {
        handleError(err, res);
        error('Failed to register provider', err);
    }
}

const handleCreateCheckoutSession = async (req, res) => {
    try {
        const { price, currency, providers, name, email, products } = req.body;
        if (!price || !currency || !providers) {
            throw new CustomError('Price, currency, and providers are required', 400);
        }
        const session = await unipayconnect.createCheckoutSession({ price, currency, providers, name, email, products });
        return res.status(201).json(session);
    } catch (err) {
        handleError(err, res);
        error('Failed to create checkout session', err);
    }
}

const handleCapturePayment = async (req, res) => {
    try {
        const { providerName, paymentId, amount, currency } = req.body;
        if (!providerName || !paymentId) {
            throw new CustomError('Provider name and payment ID are required', 400);
        }
        const result = await unipayconnect.capturePayment({ providerName, paymentId, amount, currency });
        return res.status(200).json(result);
    } catch (err) {
        handleError(err, res);
        error('Failed to capture payment', err);
    }
}

const handleVerifyWebhook = async (req, res) => {
    try {
        let providerName = req.headers['provider-name'];
        const payload = req.body;
        const signature = req.headers['paypal-transmission-sig'] || req.headers['stripe-signature'] || req.headers['X-Razorpay-Signature'];

        // Validation for provider name
        if (!providerName) {
            const userAgent = req.headers["user-agent"];

            if (userAgent.includes("PayPal")) {
                providerName = "paypal";
            } else if (userAgent.includes("Stripe")) {
                providerName = "stripe";
            } else if (userAgent.includes("Razorpay")) {
                providerName = "razorpay";
            } else {
                throw new CustomError("Provider name is required", 400);
            }
        }

        if (!payload || !signature) {
            throw new CustomError('Provider name, payload, and signature are required', 400);
        }

        const result = unipayconnect.verifyWebhookPayload(providerName, payload, signature);
        return res.status(200).json({ verified: result });
    } catch (err) {
        handleError(err, res);
        error('Failed to verify webhook', err);
    }
}

module.exports = {
    handleGetProvider,
    handleGetAllProviders,
    handleRegisterProvider,
    handleRegisterAllProviders,
    handleFetchCheckoutSession,
    handleCreateCheckoutSession,
    handleCapturePayment,
    handleVerifyWebhook,
};
