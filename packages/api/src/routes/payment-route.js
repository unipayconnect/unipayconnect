const express = require('express');
const paymentController = require('../controllers/payment-controller');
const validateProvider = require('../validators/validate-provider');

const router = express.Router();

router.get('/provider', paymentController.handleGetAllProviders);
router.get('/provider/:providerName', paymentController.handleGetProvider);
router.post('/provider/register', paymentController.handleRegisterProvider);
router.post('/providers/register', paymentController.handleRegisterAllProviders);
router.get('/fetch-checkout-session', validateProvider, paymentController.handleFetchCheckoutSession);
router.post('/create-checkout-session', validateProvider, paymentController.handleCreateCheckoutSession);
router.post('/capture-payment', validateProvider, paymentController.handleCapturePayment);
router.post('/verify-webhook', validateProvider, paymentController.handleVerifyWebhook);

module.exports = router;
