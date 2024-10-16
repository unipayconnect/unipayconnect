## UnipayConnect 👋

**UnipayConnect** is a unified payment library designed to make handling payments with **Stripe**, **PayPal**, and **Razorpay** simple and efficient. It abstracts away the complexities of using multiple payment APIs and offers a straightforward interface for **initializing payments**, **capturing payments**, and **verifying webhook events**.

## Key Features

- **Multi-provider support**: Integrates Stripe, PayPal, and Razorpay into one unified API.
- **Easy-to-use API**: Functions for creating checkout sessions, capturing payments, and verifying webhooks.
- **Customizable Checkout**: Build Stripe-like checkout pages with flexibility.
- **Simple integration**: Focus on your app while UnipayConnect handles payments.

## Requirements

Before getting started, ensure you have the following:

- **Node.js** >= 12.x
- **React** (for frontend use)
- **Express** (backend server framework)
- **API keys** for Stripe, PayPal, and Razorpay

## Installation

You can install the UnipayConnect package using npm:

```bash
npm install unipayconnect
```

## Environment Setup

# .env

Create a .env file and add your API keys and connection details:

```env
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-secret>
NODE_ENV='sandbox'||'production' for paypal
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
RAZORPAY_WEBHOOK_SECRET=<your-razorpay-webhook-secret>
PORT=<your-port>
JWT_SECRET='<your-jwt-secret>'
REACT_APP_API_URL=http://localhost
REACT_APP_RAZORPAY_KEY_ID=<your-razorpay-key-id>
REACT_APP_RAZORPAY_URL='https://checkout.razorpay.com/v1/checkout.js'
```

## How to Use UnipayConnect

- **Initialize UnipayConnect**
  In your backend application, initialize the library like this:

const unipayconnect = require('unipayconnect');

- **Create Checkout Session**
  You can create a checkout session for Stripe, PayPal, or Razorpay. This example shows how to use it:

```javascript
const session = await unipayconnect.createCheckoutSession({
  price: 250, //total value of the cart
  currency: "USD",
  providers: ["razorpay", "stripe", "paypal"],
  //Not Mandatory
  name: "Avanish",
  email: "avanishporwal01@gmail.com",
  products: [
    {
      name: "Nike Tshirt",
      price: 50,
      quantity: 1,
    },
    {
      name: "Puma shoes",
      price: 100,
      quantity: 2,
    },
  ],
});
```

- providers: Name of the provider you want to use (stripe, paypal, or razorpay).
- price: Total price of the checkout session.
- currency: Currency code (e.g., 'USD', 'INR').
- products: Array of product objects containing name, quantity, and price.

-**Capture Payment**
After a successful checkout, capture the payment:

```javascript
const paymentResult = await unipayconnect.capturePayment({
  providerName: "razorpay", // Choose provider
  paymentId: "pay_ABC123", // Payment ID from the provider
  amount: 100, // Only required for Razorpay
});
```

- providerName: Payment provider (required).
- paymentId: The ID of the payment (from Stripe/PayPal/Razorpay).
- amount: Total payment amount (required for Razorpay).

- **Verify Webhook Events**
  Webhooks are crucial for receiving updates from payment providers. Here's how you verify the webhook data:

```javascript
const isValid = unipayconnect.verifyWebhookPayload(
  req.body, // Webhook payload received from the provider
  req.headers["provider-name"] // Provider name ('stripe', 'paypal', 'razorpay')
  // Signature from webhook headers
  req.headers['paypal-transmission-sig']
  || req.headers['stripe-signature']
  || req.headers['X-Razorpay-Signature']
);
```

## API Routes Examples

- **Create Checkout Session (Example API Route)**

```javascript
app.post("/api/v1/payments/create-checkout-session", async (req, res) => {
  const { price, currency, providers, products } = req.body;
  const sessionData = await unipayconnect.createCheckoutSession({
    providerName: providers[0],
    price,
    currency,
    products,
  });
  res.status(200).json(sessionData);
});
```

- **Capture Payment (Example API Route)**

```javascript
app.post("/api/v1/payments/capture", async (req, res) => {
  const { providerName, paymentId, amount } = req.body;
  const result = await unipayconnect.capturePayment({
    providerName,
    paymentId,
    amount,
  });
  res.status(200).json(result);
});
```

- **Verify Webhook (Example API Route)**

```javascript
app.post("/api/v1/webhooks", (req, res) => {
  const providerName = req.headers["provider-name"];
  const signature =
    req.headers["stripe-signature"] || req.headers["paypal-transmission-sig"];
  const verified = unipayconnect.verifyWebhookPayload(
    providerName,
    req.body,
    signature
  );
  res.status(verified ? 200 : 400).json({ verified });
});
```

## Client Setup

To install and set up the `unipayconnect/packages/client` on your local machine, follow these steps:

### Prerequisites

1. **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

2. **npm**: npm is included with Node.js. You can check if it's installed by running the following command in your terminal:

   ```bash
   npm -v
   ```

### Step-by-Step Installation

1. **Clone the Repository**:

First, clone the unipayconnect repository from GitHub:

```bash
git clone https://github.com/yourusername/unipayconnect.git
```

2. **Navigate to the Client Directory**:

Change your working directory to the client package:

```bash
cd unipayconnect/packages/client
```

3. **Install Dependencies**:

Install the required dependencies using npm:

```bash
npm install
```

4. **Set Up Environment Variables**:

Create a .env file in the packages/client directory to store your API keys and any other environment variables required for your application:

```bash
touch .env
```

Add your configuration details:

```env
REACT_APP_API_URL=http://localhost
REACT_APP_RAZORPAY_KEY_ID=<your-razorpay-key-id>
REACT_APP_RAZORPAY_URL='https://checkout.razorpay.com/v1/checkout.js'
```

5. **Run the Development Server**:

Start the development server to see your client application in action:

```bash
npm start
```

The application should open in your default browser at http://localhost:3000.

For production, you might want to build the application by running:

```bash
npm run build
```

## Custom Checkout Page (Frontend)

UnipayConnect lets you build a custom checkout page like Stripe's. Here’s an example of a form using React Hook Form and Tailwind CSS:

```jsx
import { useForm } from "react-hook-form";

const CheckoutForm = ({ products, totalAmount }) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    // Add your submit logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
      <div className="col-left">
        <input {...register("name")} placeholder="Name" className="input" />
        <input {...register("email")} placeholder="Email" className="input" />
        <input {...register("amount")} placeholder="Amount" className="input" />
        {/* Add more fields as necessary */}
      </div>
      <div className="col-right">
        <h2>Order Summary</h2>
        {products.map((product, index) => (
          <div key={index}>
            {product.name} - ${product.price * product.quantity}
          </div>
        ))}
        <div>Total: ${totalAmount}</div>
      </div>
      <button type="submit" className="submit-button">
        Pay Now
      </button>
    </form>
  );
};
```

- **Customize Payment Providers (Radio Buttons)**
  If you want users to select a provider (Stripe, PayPal, Razorpay), you can add radio buttons:

```jsx
<div>
  <label>
    <input {...register("provider")} type="radio" value="stripe" /> Stripe
  </label>
  <label>
    <input {...register("provider")} type="radio" value="paypal" /> PayPal
  </label>
  <label>
    <input {...register("provider")} type="radio" value="razorpay" /> Razorpay
  </label>
</div>
```

## Conclusion

UnipayConnect simplifies payments across multiple providers. Whether it's creating checkout sessions, capturing payments, or verifying webhooks, it provides an easy way to integrate and manage multiple payment gateways without getting into their complex APIs.

## Feel free to contribute or raise issues in the repository!

<!--
**unipayconnect/unipayconnect** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
  -->
