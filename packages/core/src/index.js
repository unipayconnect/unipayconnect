const { CustomError } = require("./common/errorHandler");
const { info, error } = require("./common/logger");
const jwt = require("jsonwebtoken");

class UnipayConnect {
    constructor() {
        this.providers = [];
    }
    //To register a provider
    register(providerName, providerInstance) {
        if (!providerName || !providerInstance) {
            error('Provider name and instance are required for registration', new CustomError('Provider name and instance are required', 400));
            throw new CustomError('Provider name and instance are required for registration', 400);
        }
        this.providers[providerName] = providerInstance;
        info(`Provider ${providerName} registered successfully`);
    }
    //Internal method to get a provider
    async getProvider(providerName) {
        const provider = await this.providers[`${providerName}`];
        if (!provider) {
            error(`Provider ${providerName} not found`, new CustomError(`Provider ${providerName} not found`, 404));
        }
        return this.providers[`${providerName}`];
    }
    // Internal method to get all providers
    async getAllProviders() {
        const providers = await Object.keys(this.providers);
        if (!providers) {
            error(`Providers not found`, new CustomError(`Providers not found`, 404));
        }
        return providers;
    }
    //To create a session with the given provider(s)
    async createCheckoutSession({ price, currency, providers, name, email, products }) {
        const sessions = await Promise.all(providers?.map(async (provider) => {
            try {
                const instance = await this.getProvider(provider);

                if (instance && instance.createCheckoutSession) {
                    const data = await instance.createCheckoutSession({ price, currency, name, email, products });

                    if (data) {
                        info(`Checkout session created successfully with provider ${provider}`);
                        return {
                            provider,
                            status: 'success',
                            sessionData: data.session,
                            amount: data.amount,
                            orderId: data.orderId,
                            url: data.url,
                        };
                    } else {
                        return {
                            provider,
                            status: 'failed',
                            error: `Failed to create session with provider ${provider}`
                        };
                    }
                } else {
                    return {
                        provider,
                        status: 'failed',
                        error: `Provider ${provider} does not have a createCheckoutSession method or is not registered.`
                    };
                }
            } catch (err) {
                error(`Failed to create checkout session with provider ${provider}:`, err);
                return {
                    provider,
                    status: 'failed',
                    error: err.message,
                };
            }
        }));

        const successfulSessions = sessions?.filter(session => session.status === 'success');

        if (successfulSessions.length > 0) {
            const token = jwt.sign(
                { name, email, products, sessions: successfulSessions },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }//expires in 1 hour
            );
            if (!token) {
                error('Failed to generate token', new CustomError('Failed to generate token', 400));
            }
            return { successfulSessions, token };
        } else {
            error('No valid provider found for checkout session', new CustomError('No valid provider found', 400));
            throw new CustomError('No valid provider found for checkout session', 400);
        }
    }
    async initPayment(token) {
        if (!token) {
            error('Failed to capture token', new CustomError('Failed to capture token', 400));
            throw new CustomError('Failed to capture token', 400);
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            error('Session data not found', new CustomError('Session data not found', 400));
            throw new CustomError('Session data not found', 400);
        }
        return decoded;
    }
    //To capture the payment
    async capturePayment({ providerName, paymentId, amount, currency }) {
        const provider = await this.getProvider(providerName);
        if (provider && provider.capturePayment) {
            info(`Capturing payment with provider ${providerName}`);
            if (providerName === "razorpay") {
                return await provider.capturePayment(paymentId, amount, currency);
            } else {
                return await provider.capturePayment(paymentId);
            }
        }
        error(`Provider ${providerName} not found or does not support capturePayment`, new CustomError(`Provider ${providerName} not found or does not support capturePayment`, 404));
        throw new CustomError(`Provider ${providerName} not found or does not support capturePayment`, 404);
    }
    //To verify payload and establish webhook connection
    async verifyWebhookPayload(providerName, payload, signature) {
        const provider = await this.getProvider(providerName);
        if (provider && provider.verifyWebhookPayload) {
            info(`Verifying webhook payload with provider ${providerName}`);
            return provider.verifyWebhookPayload(payload, signature);
        }
        error(`Provider ${providerName} not found or does not support webhook verification`, new CustomError(`Provider ${providerName} not found or does not support webhook verification`, 404));
        throw new CustomError(`Provider ${providerName} not found or does not support webhook verification`, 404);
    }
}

const unipayconnect = new UnipayConnect();
module.exports = unipayconnect;
