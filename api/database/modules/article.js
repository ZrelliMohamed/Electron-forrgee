const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    referance: { type: Number, unique: true },
    designation: { type: String, required: true },
    unite: { type: String, required: true },
    prix_unitaire: { type: Number, required: true }
});

// Pre-save middleware to auto-increment 'referance' field
ArticleSchema.pre('save', async function (next) {
    try {
        if (!this.isNew) {
            return next(); // If not a new document, do nothing
        }

        const maxArticle = await this.constructor.findOne({}, { referance: 1 }).sort({ referance: -1 });

        if (maxArticle && maxArticle.referance >= 0) {
            this.referance = maxArticle.referance + 1;
        } else {
            this.referance = 0; // If no existing articles, start with 0
        }

        return next();
    } catch (error) {
        return next(error);
    }
});

const Article = mongoose.model('Article', ArticleSchema);
module.exports = Article;
