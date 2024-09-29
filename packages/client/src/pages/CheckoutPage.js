import React from 'react';
import Layout from '../components/Layout';
import CheckoutForm from '../components/CheckoutForm';
import axios from 'axios';

const CheckoutPage = () => {
    const handleCheckout = async (data) => {
        try {
            const response = await axios.post('/api/create-checkout-session', {
                name: data.name,
                email: data.email,
                amount: data.amount,
            });

            if (response.data.url) {
                window.location.href = response.data.url; // Redirect to the payment gateway
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    };

    return (
        <Layout>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h2 className="text-2xl font-bold leading-tight text-gray-900">Complete Your Purchase</h2>
                <CheckoutForm onSubmit={handleCheckout} />
            </div>
        </Layout>
    );
};

export default CheckoutPage;
