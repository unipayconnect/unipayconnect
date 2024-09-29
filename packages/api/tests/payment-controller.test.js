const request = require('supertest');
const app = require('../src/index');

describe('Payment API', () => {
    it('should create a checkout session', async () => {
        const response = await request(app)
            .post('/api/payments/create-checkout-session')
            .send({
                price: 100,
                currency: 'USD',
                providers: ['stripe']
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
    });

    it('should capture a payment', async () => {
        const response = await request(app)
            .post('/api/payments/capture-payment')
            .send({
                providerName: 'stripe',
                paymentId: 'some-payment-id'
            });
        expect(response.status).toBe(200);
    });

    it('should verify a webhook', async () => {
        const response = await request(app)
            .post('/api/payments/verify-webhook')
            .set('provider-name', 'paypal')
            .set('paypal-transmission-sig', 'some-signature')
            .send({
                id: 'some-event-id'
            });
        expect(response.status).toBe(200);
    });
});
