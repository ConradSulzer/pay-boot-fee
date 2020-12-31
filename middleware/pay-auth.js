module.exports = (req, res, next) => {
    if(!req.session.payAuth) {
        return res.redirect('/?action=false');
    }

    next();
}