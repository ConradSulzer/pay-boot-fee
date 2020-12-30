module.exports = (req, res, next) => {
    if(req.headers.fetched && !req.session.isLoggedIn) {
        return res.redirect(403, '/admin/login');
    }
    
    if(!req.session.isLoggedIn) {
        return res.redirect('/admin/login');
    }

    next();
}