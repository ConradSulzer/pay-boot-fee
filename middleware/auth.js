module.exports = (req, res, next) => {
    if(req.headers.fetched && !req.session.isLoggedIn) {
        return res.redirect(401, '/admin/login');
    }
    
    if(!req.session.isLoggedIn) {
        return res.redirect('/admin/login');
    }

    next();
}