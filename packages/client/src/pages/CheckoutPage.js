import React from 'react';
import Layout from '../components/Layout';
import CheckoutForm from '../components/CheckoutForm';

const CheckoutPage = () => {
    return (
        <Layout>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h2 className="text-2xl font-bold leading-tight text-gray-900 ml-6">Complete Your Purchase</h2>
                <CheckoutForm />
            </div>
        </Layout>
    );
};

export default CheckoutPage;
