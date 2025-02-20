require("module-alias/register");
// Import core functionalities
const unipayconnect = require("@unipayconnect/core/index");
const api = require("@unipayconnect/api/index");

// Merge everything into a single module
module.exports = {
    register: unipayconnect.register.bind(unipayconnect), // Expose all functions from core
    getProvider: unipayconnect.getProvider.bind(unipayconnect),
    getAllProviders: unipayconnect.getAllProviders.bind(unipayconnect),
    createCheckoutSession: unipayconnect.createCheckoutSession.bind(unipayconnect),
    initPayment: unipayconnect.initPayment.bind(unipayconnect),
    capturePayment: unipayconnect.capturePayment.bind(unipayconnect),
    verifyWebhookPayload: unipayconnect.verifyWebhookPayload.bind(unipayconnect),
    ...api   // Expose all functions from api
};