const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },  
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias", //isso vem desde categorias.js la na definicao de modelo
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }

})

mongoose.model("postagens", Postagem) //criando no DB postagens baseado em Postagem.js