module.exports = (req, res, next) => {
    if(req.session.agent.role !== 'Admin') {
       return res.redirect(401, '/admin/login');
    }

    next();
}