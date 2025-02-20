const unipayconnect = require('@core');
const { CustomError } = require('@core/common/errorHandler');

const validateProvider = async (req, res, next) => {
    const providers = await unipayconnect.providers;

    if (!providers) {
        throw new CustomError('No providers specified or invalid format', 400);
    }

    const unregisteredProviders = providers?.filter(provider => !unipayconnect.getProvider(provider));

    if (unregisteredProviders.length > 0) {
        throw new CustomError(`The following providers are not registered: ${unregisteredProviders.join(', ')}`, 400);
    }

    next();
};

module.exports = validateProvider;
