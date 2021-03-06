const express = require('express');
const router = new express.Router();
const validator = require('validator')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const payAuth = require('../middleware/pay-auth');
const paidAuth = require('../middleware/paid-auth');
const Boot = require('../models/boot-model');
const { sendReceiptUser, sendPaymentRecord } = require('../resources/emails/payment-success')
const checkinBoot = require('../resources/checkin-boot');

// GET request==========================================================================
// ======================================================================================
router.get('/', (req, res) => {
    if (req.query.action === 'false') {
       return res.status(200).render('frontend/index', {
            message: 'Error: Enter Boot ID to continue!'
        });
    }
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
});

router.get('/pay', payAuth, (req, res) => {
    const { fee, deposit } = require('../fees.json');

    req.session.fee = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fee / 100)
    req.session.deposit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deposit / 100)
    req.session.total = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((fee + deposit) / 100)

    req.session.chargeAmount = {
        fee,
        deposit,
        total: fee + deposit,
    }


    res.render('frontend/pay', {
        fee: req.session.fee,
        deposit:req.session.deposit,
        total: req.session.total,
        pubKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

router.get('/cancel', (req, res) => {
    req.session.destroy();
    res.status(200).redirect('/');
});

router.get('/payment-complete', payAuth, paidAuth, async (req, res) => {
    const unlock = req.session.boot.unlock;
    sendReceiptUser(req.session);
    sendPaymentRecord(req.session);

    res.status(200).render('frontend/payment-complete', {
        unlock
    });

    checkinBoot(req.session.boot['_id']);

    req.session.destroy();
})

router.get('/payment-fail', payAuth, (req, res) => {
    const message = req.session.paymentErrorMessage
    req.session.paymentErrorMessage = null;
    res.status(200).render('frontend/payment-fail', {
        message
    })
})
// POST request==========================================================================
// ======================================================================================
router.post('/validate-boot', async (req, res) => {
    const bootId = req.body.enterBoot;

    try {
        const boot = await Boot.findOne({ bootId });

        if (boot === null || !boot.deployed || boot.paid) {
            return res.status(200).render('frontend/index', {
                message: 'Boot is not available for payment!'
            });
        }

        req.session.payAuth = true;
        req.session.boot = boot
        req.session.save((err) => {
            if(err) {
                console.log(err);
            }

            res.status(200).redirect('/user-info');
        })
        
    } catch (err) {
        console.log(err);

        if (err) {
            return res.status(200).render('frontend/index', {
                message: 'Something went wrong! Please try again.'
            });
        }
    }
});

router.post('/user-info', payAuth, async (req, res) => {
    const errorMessages = [];
    const { email, confirmEmail } = req.body;

    if (!validator.isEmail(email)) {
        errorMessages.push('Error: Email address is invalid!');
    }

    if (email !== confirmEmail) {
        errorMessages.push('Error: Email addresses do not match!')
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
    
    req.session.email = email;

    res.status(200).redirect('/pay');
})

router.post('/charge', payAuth, async (req, res) => {
    const token = req.body.stripeToken

    try {
        const charge = await stripe.charges.create({
            amount: req.session.chargeAmount.total,
            currency: 'usd',
            description: 'Boot fee and deposit',
            source: token
        });

        if (charge.status === 'succeeded') {
            req.session.paidAuth = true;
            req.session.paidTime = new Date();
            req.session.charge = charge
            req.session.save((err) => {
                if(err) {
                    console.log(err);
                }

                res.redirect('/payment-complete')
            })
        }

    } catch (err) {
        if (err) {
            console.log(err);
            req.session.paymentErrorMessage = err.raw.message
            res.status(200).redirect('/payment-fail')
        }
    }
})

module.exports = router;