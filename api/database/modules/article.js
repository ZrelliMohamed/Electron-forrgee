const  mongoose  = require("mongoose");
const artcl = new mongoose.Schema({
    referance:Number,
    designation:{type:String,required :true},
    unite:{type:String,required :true},
    quantite:{type:Number,required:true},
    prix_unitaire:{type:Number,required:true},
    remuneration: Number
})
const article =mongoose.model('Article',artcl)
module.exports= article 