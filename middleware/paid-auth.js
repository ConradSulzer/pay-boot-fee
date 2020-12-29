module.exports = (req, res, next) => {
    if(!req.session.paidAuth) {
        return res.redirect('/');
    }

    next();
}