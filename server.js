require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint for creating a payment sheet
app.post('/payment-sheet', async (req, res) => {
    try {
        const { name, email, amount, currency } = req.body;

        // Create a new customer
        const customer = await stripe.customers.create({ name, email });

        // Create an ephemeral key
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2022-08-01' }
        );

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customer.id,
            automatic_payment_methods: { enabled: true }
        });

        // Respond with payment details
        res.status(200).send({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send({ error: 'Payment processing error' });
    }
});

// Start the server
const PORT = process.env.PORT || 7000; // Use environment variable or default to 7000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
