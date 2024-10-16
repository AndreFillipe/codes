const functions = require('firebase-functions');
const admin = require('firebase-admin');
// To avoid deployment errors, do not call admin.initializeApp() in your code

const stripe = require('stripe')('STRIPE KEY'); //replace with actual key

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = 'WEBHOOK SECRET KEY';

        const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

        if (event.type === 'checkout.session.completed') {
            const dataObject = event.data.object;
            
            await admin.firestore().collection("payments").doc().set({
                checkoutSessionId: dataObject.id,
                paymentStatus: dataObject.payment_status,
                amountTotal: dataObject.amount_total,
                amountCurrency: dataObject.currency,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });


        }

          return res.sendStatus(200);
    } catch (err) {
        return res.sendStatus(400);
    }
});
