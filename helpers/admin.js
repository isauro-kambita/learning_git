
const isAdmin  = function(req, res, next){
    if(req.isAuthenticated() && req.user.admin == 1){
        return next()
    }
    req.flash('error_msg', 'Ooops! Você precisa ser administrador e logado no sistema para acessar esta página!')
    res.redirect('/')
}

module.exports = isAdmin