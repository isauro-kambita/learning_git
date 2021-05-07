const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const bcrypt = require('bcryptjs')

//models
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: 'Oooops! Esta conta não existe. Certifique-se de logar com uma conta existente.'})
            }
            bcrypt.compare(senha, usuario.senha, (erro, iguais)=>{
                if(iguais){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'Senha incorrecta! Verifique se o Caps Lock está ligado.'})
                }
            })
        })  
    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done)=>{
        Usuario.findById(id, (err, usuario)=>{
            done(err, usuario)
        })
    })
}