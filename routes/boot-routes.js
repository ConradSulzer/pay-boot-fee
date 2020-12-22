const express = require('express');
const router = new express.Router();
const Boot = require('../models/boot-model');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/is-admin');
const genUnlock = require('../resources/gen-unlock');


// GET request===========================================================================
// ======================================================================================
router.get('/get-boots', async (req, res) => {
    const boots = await Boot.find({});
    
    const bootIds = boots.map((boot) => {
        return boot.bootId;
    });
    
    res.status(200).send(bootIds);
})

router.get('/admin/view-boots', auth, async (req, res) => {
    try {
        const boots = await Boot.find(req.query);
        boots.forEach((boot) => {
            if (boot.deployed) {
                boot.status = 'Deployed';
            } else if (boot.flagged) {
                boot.status = 'Flagged';
            } else {
                boot.status = 'Undeployed';
            }
        })
        let toggle = '';
        const key = Object.keys(req.query)[0];
        const bool = req.query[key];
        if (key === 'deployed' && bool === 'false') {
            toggle = 'not-deployed';
        } else {
            toggle = key;
        }
        res.render('partials/admin-panel/view-boots', {
            boots,
            toggle
        });
    } catch (e) {
        console.log(e);
    }
})

router.get('/admin/add-boot', auth, isAdmin, (req, res) => {
    if (req.headers.fetched === 'true') {
        res.render('partials/admin-panel/add-boot', {
            formId: 'add-boot'
        });
    } else {
        res.redirect('/admin/dashboard');
    }
});

router.get('/admin/checkout-boot', auth, (req, res) => {
    res.render('partials/admin-panel/checkout-boot');
});

router.get('/admin/checkin-boot', auth, (req, res) => {
    res.status(200).render('partials/admin-panel/checkin-boot')
})


// POST request===========================================================================
// =======================================================================================
router.post('/admin/add-boot', auth, isAdmin, async (req, res) => {
    const data = req.body;

    if (data.bootId === '') {
        return res.status('200').send(JSON.stringify({
            message: 'Error: No Boot Id',
            alert: 'alert-danger',
            status: 'failed'
        }));
    }

    const boot = new Boot(data)

    const props = ['notes', 'agent', 'location', 'make', 'model', 'plate', 'reason', 'time', 'flagged', 'status', 'deployed', 'paid', 'unlock']
                props.forEach((prop) => {
                    boot[prop] = ''
                })

    try {
        await boot.save((err, result) => {
            if (err) {
                console.log(err);
                if (err.code === 11000) {
                    return res.status(200).send([{
                        message: 'Boot already exist!',
                        alert: 'alert-danger',
                        status: 'failed'
                    }]);
                } else {
                    return res.status(200).send([{
                        message: 'Cannot create boot!',
                        alert: 'alert-danger',
                        status: 'failed'
                    }]);
                }
            } else {
                return res.status(200).send([{
                    message: 'Boot added successfully!',
                    alert: 'alert-success',
                    status: 'success'
                }]);
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/admin/checkout-boot', auth, async (req, res) => {
    const data = req.body

    await Boot.findOne({ bootId: data.bootId }, (err, boot) => {
        if (err) {
            console.log(err);
            return res.send([{
                message: 'Error checking out boot!',
                alert: 'alert-danger',
                status: 'failed'
            }]);
        }

        if (boot === null) {
            return res.status(200).send([{
                message: 'Boot ID does not exist!',
                alert: 'alert-danger',
                status: 'failed'
            }]);
        }

        if (boot.deployed && boot.deployed === true) {
            return res.status(200).send([{
                message: 'Boot already checked out!',
                alert: 'alert-danger',
                status: 'failed'
            }]);
        }

        const addData = {
            deployed: true,
            agent: req.session.agent.username,
            time: new Date(),
            unlock: genUnlock()
        }

        newBoot = Object.assign(boot, data, addData);
        newBoot.save();

        return res.status(200).send([{
            message: 'Boot checked out successfully!',
            alert: 'alert-success',
            status: 'success'
        }, {
            message: `UNLOCK CODE: ${addData.unlock}`,
            alert: 'alert-success',
            status: 'success'
        }]);
    });
});

router.post('/admin/checkin-boot', auth, async (req, res) => {
    const { bootId, action } = req.body;

    try {
        await Boot.findOne({ bootId }, async function (err, boot) {
            if (err) {
                console.log(err);
                return res.send([{
                    message: 'Error checking in boot',
                    alert: 'alert-danger',
                    status: 'fail'
                }]);
            }

            if (boot === null) {
                return res.send([{
                    message: `Cannot find boot ${bootId}!`,
                    alert: 'alert-danger',
                    status: 'fail'
                }]);
            }

            if (!boot.deployed) {
                return res.send([{
                    message: 'Boot is not checked out!',
                    alert: 'alert-danger',
                    status: 'fail'
                }]);
            }

            if (action === 'flag') {
                boot.flagged = true;
                boot.deployed = false;
                await boot.save(function (err) {
                    if (err) {
                        return res.send([{
                            message: 'Error checking in boot',
                            alert: 'alert-danger',
                            status: 'fail'
                        }]);
                    } else {
                        return res.send([{
                            message: 'Boot successfully flagged!',
                            alert: 'alert-success',
                            status: 'success'
                        }]);
                    }
                });
            } else {

                const props = ['notes', 'agent', 'location', 'make', 'model', 'plate', 'reason', 'time', 'flagged', 'status', 'deployed', 'paid']
                props.forEach((prop) => {
                    boot[prop] = ''
                })

                await boot.save(function (err) {
                    if (err) {
                        console.log(err);
                        return res.send([{
                            message: 'Error checking in boot',
                            alert: 'alert-danger',
                            status: 'fail'
                        }]);
                    } else {
                        return res.send([{
                            message: 'Boot successfully checked in!',
                            alert: 'alert-success',
                            status: 'success'
                        }]);
                    }
                });
            }
        })
    } catch (e) {
        console.log(e);
    }
})

router.post('/admin/unflag-boot', auth, async (req, res) => {
    const bootId = req.body.bootId
    try {
        await Boot.findOne({ bootId }, async function (err, boot) {
            if (err) {
                console.log(err);
                return res.send([{
                    message: 'Error removing flag!',
                    alert: 'alert-danger',
                    status: 'fail'
                }]);
            }

            if (boot === null) {
                return res.send([{
                    message: `Cannot find boot ${bootId}!`,
                    alert: 'alert-danger',
                    status: 'fail'
                }]);
            }

            const props = ['notes', 'agent', 'location', 'make', 'model', 'plate', 'reason', 'time', 'flagged', 'status', 'deployed', 'paid']
            props.forEach((prop) => {
                boot[prop] = ''
            })

            await boot.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.send([{
                        message: 'Error removing flag!',
                        alert: 'alert-danger',
                        status: 'fail'
                    }]);
                } else {
                    return res.send([{
                        message: 'Flag successfully removed!',
                        alert: 'alert-success',
                        status: 'success'
                    }]);
                }
            });

        })
    } catch (e) {
        console.log(e);
    }
});

router.post('/admin/boot-note', auth, async (req, res) => {
    console.log(req.body.id);
    try {
        await Boot.findById(req.body.id, async (err, boot) => {
            if (err) {
                console.log(err);
                return res.send([{
                    message: 'Error adding note!',
                    alert: 'alert-danger',
                    status: 'failed'
                }]);
            }

            if (boot === null) {
                return res.status(200).send([{
                    message: 'Boot ID does not exist!',
                    alert: 'alert-danger',
                    status: 'failed'
                }]);
            }

            boot.notes.push(req.body.note);

            await boot.save();

            return res.status(200).send([{
                message: 'Note added successfully!',
                alert: 'alert-success',
                status: 'success'
            }]);

        })
    } catch (e) {
        if (e) {
            console.log(e);
            return res.status(200).send([{
                message: 'Error, try again!',
                alert: 'alert-danger',
                status: 'failed'
            }]);
        }
    }

});

// DELETE request=========================================================================
// =======================================================================================
router.delete('/admin/delete-boot', auth, isAdmin, async (req, res) => {
    console.log(req.body);
    try {
        await Boot.findByIdAndDelete(req.body.id, (err, boot) => {
            if (err) {
                console.log('err', err);
                return res.send([{
                    message: 'Unable to remove boot!',
                    alert: 'alert-danger',
                    status: 'failed'
                }])
            }
            console.log('boot', boot);
            res.send([{
                message: `Boot ${boot.bootId} was removed successfully!`,
                alert: 'alert-success',
                status: 'success'
            }])

        });
    } catch (e) {
        console.log(e);
    }
});


module.exports = router;