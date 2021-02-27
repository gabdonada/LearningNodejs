//carregando modulos
const express = require('express')
const handlebars = require('express-handlebars');
const bodyParser = require("body-parser")
const app = express()
const admin = require ("./routes/admin")
const path = require ("path")
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
//Configuracoes
    //Sessao
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //Middlwere
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash("success_msg") //locals torna a variavel global
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null; //recebe dados do usuário logado e torna global
            next()
        })
    //Body Pars
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //handle bars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars');

    //Mongoose
        mongoose.Promise=global.Promise
        mongoose.connect("mongodb://localhost/blogapp", {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
            console.log("Conectado ao Mongo")
        }).catch((err)=>{
            console.log("Erro ao Conectar ao Mongo:" + err)
        })
    
    //Public
        app.use(express.static(path.join(__dirname,"public")))

        app.use((req, res, next)=>{//middleware
            
            next()//precisa por isso caso contrario a aplicação para aqui; sera chamado para todas as reqs
        })

//Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").lean().sort({data: "desc"}).then((postagens)=>{
            res.render("index", {postagens: postagens})
        }).catch((err)=>{
            //console.log(err)
            req.flash("error_msg", "Erro ao carregar categorias postagens recentes: "+err)
            res.redirect("/404")
        })
        
    })

    app.get("/postagem/:slug", (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe: " +err)
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao buscar o Slug: "+err)
            res.redirect("/")
        })
    })

    app.get("/categorias", (req,res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index", {categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar categorias: "+err)
            res.redirect("/")
        })
    })
    app.get("/categorias/:slug", (req,res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash("error_msg", "Houve um erro carregar os posts: "+err)
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg","Categoria não existe")
                res.redirect("/")
            }
            
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao carregar detalhes desta categoria: "+err)
            res.redirect("/")
        })
    })

    app.get("/404", (req,res)=>{
        res.send('Erro 404!')
    })

    app.get('/posts', (req, res) => {
        res.send('Lista de Posts')
    })
    app.use('/admin', admin) //'/admin' é o prefixo, logo precisa ser adicionar pos url /admin;
    app.use("/usuarios", usuarios)
    
//Outros
const port = 8081
app.listen(port, ()=> {
    console.log("Servidor online")
})