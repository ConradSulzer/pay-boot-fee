const express = require('express');
const router = new express.Router();
const validator = require('validator')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const payAuth = require('../middleware/pay-auth');
const Boot = require('../models/boot-model');

// GET request==========================================================================
// ======================================================================================
router.get('/', (req, res) => {
    res.status(200).render('frontend/index');
});

router.get('/user-info', payAuth, (req, res) => {
    const boot = req.session.boot

    res.render('frontend/user-info', {
        boot: {
            make: boot.make,
            model: boot.model,
            plate: boot.plate
        }
    })
})

// POST request==========================================================================
// ======================================================================================
router.post('/validate-boot', async (req, res) => {
    const bootId = req.body.enterBoot;

    try {
        const boot = await Boot.findOne({ bootId });

        if (boot === null || !boot.deployed) {
            return res.status(200).render('frontend/index', {
                message: 'Boot is not available for payment'
            });
        }

        req.session.payAuth = true;
        req.session.boot = boot

        res.status(200).redirect('/user-info');


    } catch (e) {
        console.log(e);

        if (e) {
            return res.status(200).render('frontend/index', {
                message: 'Something went wrong! Please try again.'
            });
        }
    }

    res.redirect('/user-info');
});

router.post('/user-info', payAuth, async (req, res) => {
    const errorMessages = [];
    const { firstname, lastname, email } = req.body;

    if (firstname === '' || lastname === '') {
        errorMessages.push('Error: Must enter name!');
    }

    if (!validator.isAlpha(firstname) || !validator.isAlpha(lastname)) {
        errorMessages.push('Error: Name can only contain letters (a-zA-Z)!');
    }

    if (!validator.isEmail(email)) {
        errorMessages.push('Error: Email address is invalid!');
    }

    if (errorMessages.length > 0) {
        return res.status(200).render('frontend/user-info', {
            messages: errorMessages,
            boot: {
                make: req.session.boot.make,
                model: req.session.boot.model,
                plate: req.session.boot.plate
            }
        })
    }

    req.session.firstname = firstname;
    req.session.lastname = lastname;
    req.session.email = email;

    console.log(req.session);

    res.status(200).send('completed successfully');
})

router.post("/payment-intent", async (req, res) => {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: '',
      currency: "usd"
    });
    res.send({
      clientSecret: paymentIntent.client_secret
    });
  });

module.exports = router;