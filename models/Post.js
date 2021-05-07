const db = require('./db')
const  Sequelize  = require('sequelize')

const Post = db.sequelize.define('posts', {
    titulo:{
        type: db.Sequelize.STRING
    },
    conteudo:{
        type: db.Sequelize.TEXT
    }
})

//Post.sync({force: true})
module.exports = Post