const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    referance: { type: Number, unique: true },
    designation: { type: String, required: true },
    unite: { type: String, required: true },
    prix_unitaire: { type: Number, required: true }
});

const Article = mongoose.model('Article', ArticleSchema);
module.exports = Article;
