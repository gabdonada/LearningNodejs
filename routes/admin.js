const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require ("../models/Categoria")
const Categoria = mongoose.model("categorias") //exatamente o nome dado entre "" em Categoria.js... Passa referencia para a constante
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
const {eAdmin} = require ("../helpers/eAdmin") //pega só a função 'eAdmin' dentro de eAdmin file; variavel aqui = eAdmin

//aqui se define rotas
router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) =>{
    res.send("Pagina de posts")
})

router.get('/categorias', eAdmin, (req, res) =>{
    
    
    Categoria.find().lean().sort({date:'desc'}).then((categorias)=>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias: "+err)
        res.redirect("/admin")
    })
    
})

router.get('/categorias/add', eAdmin, (req, res) =>{
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', eAdmin, (req, res) =>{

    //validacao
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto:"Nome da categoria muito pequeno"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido!"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias",{erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso")
            //console.log("Categoria salva com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("erro_msg","Houve um erro ao salvar a categoria: "+err)
            //console.log("Erro ao salvar nova categoria: "+err)
            res.redirect("/admin/categorias")
        })
    }

    
})

router.get("/categorias/edit/:id", eAdmin, (req,res) => {
    //res.send("Pagina de edição de categoria")
    Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias",{categoria: categoria})
    }).catch((err)=>{
        req.flash("error_msg","Essa categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})

router.post("/categorias/edit", eAdmin, (req,res) => { //nessa aqui nao vai o .lean() pq tem em cima
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{ //utilizar body quando e a variavel do Body e params quando é para imputar na tela
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        //esta sem validacao

        categoria.save().then(() =>{
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a edição da categoria: "+err)
            res.redirect("/admin/categorias")
        })
    }).catch((err)=>{
       req.flash("error_msg", "Houve um erro ao editar a categoria: "+err)
       res.redirect("/admin/categorias") 
    })
})

router.post("/categorias/deletar", eAdmin, (req,res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao deletar categoria: "+err)
        res.redirect("/admin/categorias")
    })
})

//pagina de postagens
router.get("/postagens", eAdmin, (req,res)=>{
    //res.render("admin/postagens")

    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{ //categoria é nome do campo no modelo de Postagem
        res.render("admin/postagens", {postagens:postagens})
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar postagens: "+err)
        res.redirect("/admin")
    })

    /** 
    Postagem.find().lean().sort({date:'desc'}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as postagens: "+err)
        res.redirect("/admin")
    })*/
})

router.get("/postagens/add", eAdmin, (req,res) => {
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias}) //encaminhando os dados para a page
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias: "+err)
        res.redirect("/admin")
    })
    
})

router.post("/postagens/nova", eAdmin, (req, res)=>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria invalida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem")
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg","Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar: "+err)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req, res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{//params pq ta pegando do link
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao listar as categorias: "+err)
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Ocorreu um erro ao carregar o formulario: "+err)
        res.redirect("/admin/postagens")
    }) 
    
})

router.post("/postagem/edit", eAdmin, (req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg","Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","Erro ao salvar edição de postagem: "+err)
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao editar: "+err)
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{ //meio não tão seguro por ser get
        req.flash("success_msg","Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg","Erro ao deletar postagem: "+err)
        res.redirect("/admin/postagens")
    })
})

module.exports = router
