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
