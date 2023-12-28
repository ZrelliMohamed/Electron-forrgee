const Article = require('../database/modules/article');

module.exports = {
    getArticles: async (req, res) => {
        try {
            const allArticles = await Article.find({});
            res.json(allArticles);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    addArticle: async (req, res) => {
        try {
            const { referance } = req.body;
            // Check if an article with the same reference already exists
            const existingArticle = await Article.findOne({ referance });
    
            if (existingArticle) {
                return res.status(400).json({ message: "Article with the same reference already exists" });
            }
    
            let newArticle = new Article(req.body);
            await newArticle.save();
            res.json("Article successfully added");
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    

    deleteArticleByReference: async (req, res) => {
        const { referance } = req.params;

        try {
            const deletedArticle = await Article.findOneAndDelete({ referance: referance });
            if (!deletedArticle) {
                return res.status(404).json({ message: "Article not found" });
            }
            res.json({ message: "Article successfully deleted", deletedArticle });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    updateArticleByReference: async (req, res) => {
        const { referance } = req.params;

        try {
            const updatedArticle = await Article.findOneAndUpdate(
                { referance: referance },
                { $set: req.body },
                { new: true }
            );

            if (!updatedArticle) {
                return res.status(404).json({ message: "Article not found" });
            }

            res.json({ message: "Article successfully updated", updatedArticle });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getOneArticleByReference: async (req, res) => {
        const { referance } = req.params;

        try {
            const article = await Article.findOne({ referance: referance });
            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }
            res.json(article);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};
