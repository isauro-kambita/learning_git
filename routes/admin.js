const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const isAdmin = require('../helpers/admin')


router.get('/categorias', isAdmin, (req, res)=>{
    Categoria.find().sort({data: 'desc'}).then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve erro ao listar categorias!')
        res.redirect('/admin')
    })
})


router.get('/categorias/add', isAdmin, (req, res)=>{
    res.render('admin/addcategorias')   
})

router.post('/categorias/nova', isAdmin, (req, res)=>{
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido!"})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito curto!"})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
            data: (new Date().toDateString()+' '+ new Date().toTimeString())
        }
        new Categoria(novaCategoria).save().then(() =>{
            req.flash('success_msg', 'Categoria criada com sucesso.')
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg', 'Houve erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })
    }

})

router.get('/categorias/editar/:id', isAdmin, (req, res)=>{
    Categoria.findOne({_id: req.params.id}).then((categoria)=>{
        res.render('admin/edicategorias', {categoria: categoria})
    }).catch((err)=>{
        req.flash('error_msg', 'Esta categoria não existe!')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/editar', isAdmin, (req, res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash('success_msg', 'Categoria editada com sucesso.')
            res.redirect('/admin/categorias')
        }).catch((err) =>{
            req.flash('error_msg', 'Houve erro internamente ao salvar a edição da categoria!')
            res.redirect('/admin/categorias')
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve erro na edição da categoria!")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', isAdmin, (req, res) =>{
    Categoria.deleteOne({_id: req.body.id}).then(() =>{
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err) =>{
        req.flash('error_msg', 'Erro ao deletar categoria.')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens/add', isAdmin, (req, res)=>{
    Categoria.find().sort({nome: 'asc'}).then((categorias)=>{
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve erro ao carregar o formulário!')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', isAdmin, (req, res)=>{
    var erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Título inválido!'})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválida!'})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: 'Descrição inválida!'})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == null || req.body.conteudo == null){
        erros.push({texto: 'Conteúdo inválido!'})
    }
    if(req.body.categoria == '0'){
        erros.push({tetxo: 'Categoria inválida, registe nova categoria!'})
    }
    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            data: (new Date().toDateString()+' '+ new Date().toTimeString())
        }
    
        new Postagem (novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Postagem guardada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', 'Houve erro ao guardar postagem')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens', isAdmin, (req, res)=>{
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve erro ao listar postagens!')
        res.redirect('/admin')
    })
})

router.get('/postagens/editar/:id', isAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
        Categoria.find().sort({nome: 'asc'}).then((categorias)=>{
            res.render('admin/edipostagens', {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve erro ao listar as categorias!')
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('Error_mgs', 'Houve erro no carregamento do formulário!')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/editar', isAdmin, (req, res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.descricao = req.body.descricao
        postagem.slug = req.body.slug
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg', 'Postagem editada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', 'Ocorreu um erro internamente ao salvar a edição do post!')
            res.redirect('/admin/postagens')
        })

    }).catch((err)=>{
        req.flash('error_msg', 'Houve erro ao salvar a edição da postagem!')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/deletar', isAdmin, (req, res)=>{
    Postagem.deleteOne({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'Postagem apagada com sucesso.')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', 'Ocorreu um erro ao apagar a postagem!')
        res.redirect('/admin/postagens')
    })
})


module.exports = router