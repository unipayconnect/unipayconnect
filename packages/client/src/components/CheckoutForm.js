import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const CheckoutPage = () => {
    const { register, handleSubmit, formState: { errors }, watch, reset, setError } = useForm();

    const [providers, setProviders] = useState([
        'stripe',
        'paypal',
        'razorpay',
    ]);

    const [currencies, setCurrencies] = useState([
        'USD', 'INR', 'EUR', 'GBP', 'JPY'
    ]);

    const selectProvider = watch('provider');
    const selectedCurrency = watch('currency', 'USD');

    const [products, setProducts] = useState([]);

    const totalAmount = useMemo(() => {
        return products?.reduce((acc, product) => acc + (product.price * product.quantity), 0) || 0;
    }, [products]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = process.env.REACT_APP_RAZORPAY_URL;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const onSubmit = async (data) => {
        const apiKeys = {
            razorpay: {
                key_id: process.env.REACT_APP_RAZORPAY_KEY_ID,
                key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET
            },
            stripe: process.env.REACT_APP_STRIPE_SECRET_KEY,
            paypal: process.env.REACT_APP_PAYPAL_CLIENT_SECRET
        };
        try {
            const body = {
                providerName: selectProvider,
                apiKey: apiKeys[selectProvider]
            }
            const result = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/payments/provider/register`, body)

            const payload = {
                price: totalAmount,
                currency: selectedCurrency,
                providers: [selectProvider],
                name: data.name,
                email: data.email,
                products: products,
            };

            if (result.data.message) {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/payments/create-checkout-session`, payload);
                // Handle redirect/payment flow here...
                const session = response.data.successfulSessions?.find(session => session.provider === selectProvider);
                if (session.provider === 'razorpay') {
                    // Frontend Razorpay payment options
                    const razorOptions = {
                        key: `${process.env.REACT_APP_RAZORPAY_KEY_ID}`,  // Razorpay Key ID, passed from backend if needed
                        amount: session.sessionData.amount,      // In paise, ensure this is calculated correctly
                        currency: session.sessionData.currency,  // Set currency
                        // "name": name,                // Name of the payer
                        description: "Transaction",  // Short description
                        order_id: session.sessionData.id,        // Razorpay order ID (should be generated from the backend)
                        handler: async function (response) {
                            // Handle successful payment response from Razorpay
                            console.log("Payment ID:", response.razorpay_payment_id);
                            console.log("Order ID:", response.razorpay_order_id);
                            console.log("Signature:", response.razorpay_signature);
                        },
                        prefill: {
                            name: data.name,    // Pre-fill user’s name
                            email: data.email   // Pre-fill user’s email
                        },
                        theme: {
                            "color": "#3399cc"  // Customize the theme color of Razorpay checkout
                        }
                    };

                    // Initialize Razorpay payment with the options
                    const rzp1 = new window.Razorpay(razorOptions);

                    // Start the Razorpay payment process
                    rzp1.open();
                }
                else {
                    if (session.url) {
                        window.location.href = session.url; // Redirect to the payment gateway
                    }
                }
                reset();
                setProducts([]);
            } else {
                console.error("Error: Registering provider", selectProvider);
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);

            // Handle API error response
            if (error.response && error.response.data) {
                const apiError = error.response.data.error; // Adjust based on your API's error structure
                setError("apiError", {
                    type: "manual",
                    message: apiError || "An error occurred. Please try again.",
                });
            }
        }
    };

    const handleAddProduct = () => {
        setProducts([...products, { name: '', price: 0, quantity: 1 }]);
    };

    // Handle removing a product
    const handleRemoveProduct = (index) => {
        const updatedProducts = products?.filter((_, i) => i !== index);
        setProducts(updatedProducts);
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = products.map((product, i) =>
            i === index ? { ...product, [field]: field === 'price' || field === 'quantity' ? Number(value) : value } : product
        );
        setProducts(updatedProducts);
    };


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: User Details & Payment Form */}
                <div className="p-6">
                    <h3 className="text-2xl font-semibold mb-4">Billing Information</h3>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Name Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input
                                type="text"
                                {...register('name', { required: 'Name is required' })}
                                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                            <input
                                type="email"
                                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email format' } })}
                                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Currency Selection */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Currency</label>
                            <select
                                {...register('currency', { required: 'Currency is required' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {currencies?.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                            {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>}
                        </div>

                        {/* Payment Provider Selection */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Payment Provider</label>
                            <div className="flex flex-row space-x-2">
                                {providers?.map((provider) => {
                                    return (
                                        <label key={provider} className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value={provider}
                                                {...register('provider', { required: true })}
                                                className="mr-2 cursor-pointer"
                                            />
                                            {provider.charAt(0).toUpperCase() + provider?.slice(1)}
                                        </label>
                                    )
                                })}
                            </div>
                            {errors.provider && <p className="text-red-500">Provider selection is required</p>}
                        </div>
                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Pay Now
                        </button>
                        {errors.apiError && <p className="text-red-500 text-center">{errors.apiError.message}</p>}
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="p-6 bg-gray-100 rounded-md">
                    <h3 className="text-2xl font-semibold mb-4">Order Summary</h3>

                    {/* Wrapping the product list and total in a flex column container */}
                    <div className="flex flex-col h-[80%]">

                        {/* Product list container with scroll */}
                        <div className="flex-grow border-t border-gray-300 pt-4 overflow-y-scroll">
                            {products?.map((product, index) => (
                                <div key={index} className="mb-2 flex justify-between items-center">
                                    {/* Editable fields for product name, quantity, price */}
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                        className="w-1/3 px-2 py-1 border border-gray-300 rounded-md mr-2"
                                        placeholder="Product Name"
                                    />
                                    <input
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                        className="w-1/5 px-2 py-1 border border-gray-300 rounded-md mr-2"
                                        placeholder="Quantity"
                                    />
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                        className="w-1/5 px-2 py-1 border border-gray-300 rounded-md mr-2"
                                        placeholder="Price"
                                    />

                                    {/* Remove product button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Button to add a new product */}
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Add Product
                        </button>

                        {/* Fixed total at the bottom */}
                        <div className="border-t border-gray-300 pt-4 flex justify-between sticky bottom-0 bg-gray-100">
                            <span className="text-gray-700 font-semibold">Total:</span>
                            <span className="font-bold">
                                {selectedCurrency} {totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default CheckoutPage;
