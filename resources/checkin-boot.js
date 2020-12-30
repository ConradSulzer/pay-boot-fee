const Boot = require('../models/boot-model');

module.exports = async (id) => {
    try {
        const boot = await Boot.findById(id);

        boot.paid = true

        await boot.save();

    } catch (err) {
        if (err) {
            console.log(err);
        }
    }
}