module.exports = (req, res, next) => {
    if(req.session.agent.role !== 'Admin') {
       return res.redirect('/admin/login?admin=false');
    }

    next();
}