const express = require('express');
const router = new express.Router();
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Agent = require('../models/agent-model');


// GET request===========================================================================
// ======================================================================================
router.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

router.get('/admin/logout', async (req, res) => {
    console.log('logout requested');
    req.session.destroy();
    res.render('admin/login', {
        message: 'Successfully signed out!',
        alert: 'alert-success'
    });
});
 
// POST request==========================================================================
// ======================================================================================
router.post('/admin/login', async (req, res) => {
    console.log(req.body);
    const invalidLogin = {
        message: 'Invalid username/password',
        alert: 'alert-danger'
    }

    if(!req.body.username || !req.body.password) {
        return res.render('admin/login', invalidLogin);
    }

    const username = req.body.username;
    const password = req.body.password;
    const agent = await Agent.findOne({ username: username });
    console.log(agent);

    if (!agent) {
        return res.render('admin/login', invalidLogin);
    }

    const isPassMatch = await bcrypt.compare(password, agent.password);
    console.log(isPassMatch);

    if (isPassMatch) {
        req.session.isLoggedIn = true;
        req.session.agent = agent;
        
        return req.session.save(function (err) {
            if(err) {
                return res.render('admin/login', {
                    message: 'Unable to login.',
                    alert: 'alert-danger'
                });
            }else {
                console.log('legit');
                res.redirect('/admin/dashboard');
            }
        });

    } else {
        return res.render('admin/login', invalidLogin);
    } 

});

router.get('/admin/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login', {
        message: 'Successfully logged out!',
        alert: 'alert-success'
    });
});

module.exports = router;