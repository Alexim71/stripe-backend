require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
       const express = require('express');
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
// const host = '192.168.1.117'; //system ip addr
const host = '192.168.0.123'; //system ip addr

app.post('/payment-sheet', async (req, res) => {
    try {
        const data = req.body;
        console.log(req.body);
        const params = {
            name: data.name,
            email: data.email
        };
        const customer = await stripe.customers.create(params);
        console.log(customer.id);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2022-08-01' }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: data.amount,
            currency: data.currency,
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true
            }
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id
        }

        res.status(200).send(response);

    } catch (error) {
        console.log(error)
    }
})

app.listen(7000, '0.0.0.0', () => console.log('Running on port 7000'));