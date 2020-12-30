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
    res.render('admin/admin-dashboard', {
        dashboardMainPartial: false,
        role: req.session.agent.role,
        message: `Welcome to the dashboard, ${req.session.agent.firstname}!`
    });
});

router.get('/admin/add-agent', auth, isAdmin, (req, res) => {
    if (req.headers.fetched === 'true') {
        res.render('partials/admin-panel/add-agent', {
            formId: 'add-agent'
        });
    } else {
        res.redirect('/admin/dashboard');
    }
});

router.get('/admin/view-agents', auth, isAdmin, async (req, res) => {
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
})

router.get('/admin/prices', auth, isAdmin, (req, res) => {
    if (req.headers.fetched === 'true') {
        const { fee, deposit } = require('../fees.json');

        res.render('partials/admin-panel/prices', {
            fee,
            deposit
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
        res.send(JSON.stringify(errorMessages));
        return
    }

    // Create agent
    const agent = new Agent({
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        role: data.role
    })

    agent.password = await bcrypt.hash(data.password, 8);

    await agent.save((err, result) => {
        if (err) {
            if (err.code === 11000) {
                return res.status(200).send([{
                    message: 'Username already exist!',
                    alert: 'alert-danger'
                }]);
            } else {
                return res.status(200).send([{
                    message: 'Cannot create user!',
                    alert: 'alert-danger'
                }]);
            }
        } else {
            return res.status(200).send([{
                message: 'Agent added successfully!',
                alert: 'alert-success'
            }]);
        }
    });
});

router.post('/admin/prices', auth, isAdmin, async (req, res) => {
    const data = req.body;

    let dataString = JSON.stringify(data, null, 2);

    fs.writeFile('fees.json', dataString, (err) => {
        if (err) throw err;
        console.log(err)
    });

    res.status(200).send([{
        message: 'Price changed successfully',
        alert: 'alert-success'
    }]);
});

// PUT request========================================================================
// ======================================================================================
router.put('/admin/edit-password', auth, isAdmin, async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 8)
    try {
        await Agent.findByIdAndUpdate({ _id: req.body.agentId }, { $set: { password } }, (err, doc) => {
            if (err || !doc) {
                res.send([{
                    message: 'Unable to edit password!',
                    alert: 'alert-danger'
                }]);
            } else {
                res.status(200).send([{
                    message: 'Password successfully updated',
                    alert: 'alert-success'
                }]);
            }
        });
    } catch (e) {
        res.status(500).send([{
            message: 'Unable to edit password!',
            alert: 'alert-danger'
        }]);
    }
});

// DELETE request========================================================================
// ======================================================================================
router.delete('/admin/delete-agent', auth, isAdmin, async (req, res) => {
    try {
        await Agent.findByIdAndDelete(req.body.agentId, (err, doc) => {
            if (err) {
                return res.send([{
                    message: 'Unable to remove user!',
                    alert: 'alert-danger'
                }]);
            }

            if(doc === null) {
                return res.send([{
                    message: 'User does not exist',
                    alert: 'alert-danger'
                }])
            }

            res.send([{
                message: `${doc.username} was removed successfully!`,
                alert: 'alert-success'
            }])

        });
    } catch (e) {
        console.log(e);
    }
})

module.exports = router;