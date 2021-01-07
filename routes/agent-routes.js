const express = require('express');
const router = new express.Router();
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Agent = require('../models/agent-model');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/is-admin');
const fs = require('fs');

// GET request===========================================================================
// ======================================================================================
router.get('/admin/dashboard', auth, (req, res) => {
    res.status(200).render('admin/admin-dashboard', {
        dashboardMainPartial: false,
        role: req.session.agent.role,
        message: `Welcome to the dashboard, ${req.session.agent.firstname}!`
    });
});

router.get('/admin/add-agent', auth, isAdmin, (req, res) => {
    if (req.headers.fetched === 'true') {
        res.status(200).render('partials/admin-panel/add-agent', {
            formId: 'add-agent'
        });
    } else {
        res.redirect('/admin/dashboard');
    }
});

router.get('/admin/view-agents', auth, isAdmin, async (req, res) => {
    try {
        const agents = await Agent.find({});

        const dataArray = agents.map((agent) => {
            const agentObj = agent.toObject()

            delete agentObj.password;
            delete agentObj['__v'];

            return agentObj
        });

        res.render('partials/admin-panel/view-agents', {
            agents: dataArray
        });
    } catch (err) {
        console.log(err);
        res.status(500).render('partials/admin-panel/module-unavailable');
    }
})

router.get('/admin/prices', auth, isAdmin, (req, res) => {
    if (req.headers.fetched === 'true') {
        const { fee, deposit } = require('../fees.json');

        res.render('partials/admin-panel/prices', {
            fee: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fee / 100),
            deposit: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deposit / 100)
        });
    } else {
        res.redirect('/admin/dashboard');
    }
});

// POST request==========================================================================
// ======================================================================================
router.post('/admin/add-agent', auth, isAdmin, async (req, res) => {
    const data = req.body;
    const errorMessages = [];

    // Validate data ------------------------
    if (!validator.isAlpha(data.firstname) || !validator.isAlpha(data.lastname)) {
        errorMessages.push({
            message: 'Names are letters only (a-zA-Z)',
            alert: 'alert-danger'
        })
    }

    if (!validator.equals(data.password, data.passwordConfirm)) {
        errorMessages.push({
            message: 'Passwords do not match',
            alert: 'alert-danger'
        })
    }

    if (errorMessages.length > 0) {
        res.status(400).send(errorMessages);
        return
    }

    // Create user ------------------------
    try {
        const agent = new Agent({
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            role: data.role
        })

        agent.password = await bcrypt.hash(data.password, 8);

        await agent.save()

        return res.status(201).send([{
            message: 'Agent added successfully!',
            alert: 'alert-success'
        }]);

    } catch (err) {
        console.log(err);

        if (err) {
            if (err.code === 11000) {
                return res.status(200).send([{
                    message: 'Username already exist!',
                    alert: 'alert-danger'
                }]);
            } else {
                return res.status(500).send([{
                    message: 'Cannot create user!',
                    alert: 'alert-danger'
                }]);
            }
        }
    }
});

router.post('/admin/prices', auth, isAdmin, async (req, res) => {
    const data = {
        fee: parseFloat(req.body.fee) * 100,
        deposit: parseFloat(req.body.deposit) * 100
    };
    
    console.log(data);

    let dataString = JSON.stringify(data, null, 2);

    try {
        fs.writeFile('fees.json', dataString, (err) => {
            if (err) throw err;
        });

        res.status(200).send([{
            message: 'Price changed successfully',
            alert: 'alert-success',
            status: 'success'
        }]);
    } catch (err) {
        console.log(err);

        res.status(500).send([{
            message: 'Something went wrong, try again!',
            alert: 'alert-danger',
            status: 'fail'
        }]);
    }
});

// PUT request========================================================================
// ======================================================================================
router.put('/admin/edit-password', auth, isAdmin, async (req, res) => {
    try {
        const password = await bcrypt.hash(req.body.password, 8);

        await Agent.findByIdAndUpdate({ _id: req.body.agentId }, { $set: { password } });

        res.status(200).send([{
            message: 'Password successfully updated',
            alert: 'alert-success',
            status: 'success'
        }]);

    } catch (err) {
        console.log(err);

        if(err) {
            res.status(500).send([{
                message: 'Unable to edit password!',
                alert: 'alert-danger',
                status: 'fail'
            }]);
        }
    }
});

// DELETE request========================================================================
// ======================================================================================
router.delete('/admin/delete-agent', auth, isAdmin, async (req, res) => {
    try {
        const doc = await Agent.findByIdAndDelete(req.body.agentId);

        if (doc === null) {
            return res.send([{
                message: 'User does not exist',
                alert: 'alert-danger',
                status: 'fail'
            }])
        }

        res.send([{
            message: `${doc.username} was removed successfully!`,
            alert: 'alert-success',
            status: 'success'
        }])

    } catch (err) {
        console.log(err);

        if (err) {
            return res.send([{
                message: 'Unable to remove user!',
                alert: 'alert-danger',
                status: 'fail'
            }]);
        }
    }
})

module.exports = router;