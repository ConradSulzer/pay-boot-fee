const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const Agent = require('../models/agent-model');
const auth = require('../middleware/auth');


// GET request===========================================================================
// ======================================================================================
router.get('/admin/login', (req, res) => {
    let data = {}

    if (req.query.loggedOut === 'true') {
        data = {
            message: 'Successfully signed out!',
            alert: 'alert-success'
        }
    }

    if (req.query.admin === 'false') {
        data = {
            message: 'You must be logged in as an Admin to access that resource!',
            alert: 'alert-danger'
        }
    }

    res.status(200).render('admin/login', data);
});

router.get('/admin/logout', auth, async (req, res) => {
    req.session.destroy();
    const isLoggedOut = encodeURIComponent('true');

    res.status(200).redirect('/admin/login?loggedOut=true');
});

// POST request==========================================================================
// ======================================================================================
router.post('/admin/login', async (req, res) => {
    const invalidLogin = {
        message: 'Invalid username/password',
        alert: 'alert-danger'
    }

    if (!req.body.username || !req.body.password) {
        return res.status(403).render('admin/login', invalidLogin);
    }

    try {
        const username = req.body.username;
        const password = req.body.password;

        const agent = await Agent.findOne({ username: username });

        if (!agent) {
            return res.status(403).render('admin/login', invalidLogin);
        }

        const isPassMatch = await bcrypt.compare(password, agent.password);

        if (isPassMatch) {
            req.session.isLoggedIn = true;
            req.session.agent = agent;

            req.session.save((err) => {
                if(err) {
                    console.log(err);
                }

                res.status(200).redirect('/admin/dashboard');
            });

        } else {
            return res.status(403).render('admin/login', invalidLogin);
        }
    } catch (err) {
        if (err) {
            return res.status(500).render('admin/login', {
                message: 'Unable to login.',
                alert: 'alert-danger'
            });
        }
    }
});

module.exports = router;