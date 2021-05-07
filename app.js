//Carregamento de módulos
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
require('./models/Categoria')
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
const usuario = require('./routes/usuario')
const passport = require('passport')
require('./cofing/auth')(passport)
const isAdmin = require('./helpers/admin')



const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const app = express()


//configurações
    //session
    app.use(session({
        secret: "myApp",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
    //body-parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        
        next()
    })

    //handlebars
    app.engine('handlebars', expressHandlebars({
        handlebars: allowInsecurePrototypeAccess(Handlebars)
    }))  

    //app.engine('handlebars', Expresshandlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')


    //const mongoose = require('mongoose')
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/postsDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then((req, res)=>{
        console.log('Connexão ao mongoDB feita com sucesso.')
    }).catch((err)=>{
        console.log('Erro de conexão ao banco de dados '+err)
    })


    //path
    app.use(express.static(path.join(__dirname, "public")))
//principa
app.get('/', (req, res)=>{
    Postagem.find().populate('categoria').sort({data: 'desc'}).limit(3).then((postagens)=>{
        res.render('index', {postagens: postagens})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve erro ao carregar as postagens!')
        res.render('/404')
    })
})
    
//rotas

    app.get('/admin', isAdmin, (req, res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
            res.render('admin/index', {postagens: postagens})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve erro ao carregar as postagens!')
            res.redirect('/admin')
        })
    })

    app.get('/admin/sobre', (req, res)=>{
        dados = [
            {
                developer: 'Isaías António Kambita',
                age: 29,
                location: 'Luanda',
                ocupation: [
                    'Computer engineer',
                    ' Mathematician',
                    ' System Analist'
                ],
                ownership: 66.67
            },
            {
                developer: 'Joaquim Galagunga Manuel',
                age: 29,
                location: 'Luanda',
                ocupation: [
                    'Computer engineer',
                    ' Mathematician'
                ],
                ownership: 20.00
            },
            {
                developer: 'Adilson Rafael Katiavala',
                age: 27,
                location: 'Luanda',
                ocupation: [
                    'Computer engineer',
                    ' Mathematician'
                ],
                ownership: 13.33
            }
        ]
        res.render('admin/about', {dados: dados})
    })

    app.get('/categorias', (req, res)=>{
        Categoria.find().sort({data: 'desc'}).then((categorias)=>{
            res.render('categorias/index', {categorias: categorias})
        }).catch((err)=>{
            req.flash('error_msg', 'Erro ao alistar as categorias!')
            res.redirect('/')
        })
    })

    app.get('/postagem/:slug', (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).populate('categoria').then((postagem)=>{
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Esta postagem não existe!')
                res.redirect('/')
            }

        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens)=>{
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash('error_msg', 'Erro ao alistar os posts!')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Esta categoria não existe!')
                res.redirect('/')
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao alistar as categorias!')
            res.redirect('/')
        })
    })


    app.use('/admin', admin)
    app.use('/usuario', usuario)
    app.get('/404', (req, res)=>{
        res.send('Erro 404')
    })


//outros
const PORT = 8020
app.listen(PORT, ()=>{
    console.log('Servidor da aplicação rodando na porta: '+PORT)
})


