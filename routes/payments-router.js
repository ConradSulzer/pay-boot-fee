const express = require('express');
const router = new express.Router();
const validator = require('validator')
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

        if(e) {
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
        errorMessages.push({
            message: 'Error: Must enter name!'
        });
    }

    if (!validator.isAlpha(firstname) || !validator.isAlpha(lastname)) {
        errorMessages.push({
            message: 'Error: Name can only contain letters (a-zA-Z)!'
        });
    }

    if (!validator.isEmail(email)) {
        errorMessages.push({
            message: 'Error: Email address is invalid!'
        });
    }
})


module.exports = router;