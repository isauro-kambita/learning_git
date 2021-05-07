const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')


router.get('/registo', (req, res)=>{
    res.render('usuarios/registo')
})

router.post('/registo', (req, res)=>{
    var erros = []
    
    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.email || req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido!"})
    }
    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida!"})
    }
    if(req.body.senha.length < 6){
        erros.push({texto: "Senha muito curta!"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas diferentes! Tente novamente."})
    }
    if(erros.length > 0){
        res.render('usuarios/registo', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg', 'Você já possui uma conta no sistema!')
                res.redirect('/usuario/registo')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

               bcrypt.genSalt(10, (err, salt)=>{
                   bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                       if(erro){
                           req.flash('error_msg', 'Houve erro ao gerar a senha!')
                           res.redirect('/usuario/registo')
                       }else{
                        novoUsuario.senha = hash
                        novoUsuario.save().then(()=>{
                            req.flash('success_msg', 'Usuário cadastrado com sucesso.')
                            res.redirect('/')
                        }).catch((err)=>{
                            req.flash('error_msg', 'Houve erro interno ao cadastrar o usuário!')
                            res.redirect('/usuario/registo')
                        })
                       }
                   })
               })
            }  
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/')
        })
    }
})
 

router.get('/login', (req, res)=>{
    res.render('usuarios/login')
})

router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: true,
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res)=>{
    req.logout()
    req.flash('success_msg', 'Usuario deslogado com sucesso!')
    res.redirect('/')
})
module.exports = router