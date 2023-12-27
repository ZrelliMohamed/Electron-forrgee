const express = require('express');
const { addArticle, getArticles, deleteArticleByReference, updateArticleByReference,getOneArticleByReference } = require('../controller/article');
const articleRoute = express.Router();

articleRoute.get('/get', getArticles);
articleRoute.get('/getOne/:referance', getOneArticleByReference);
articleRoute.post('/add', addArticle);
articleRoute.delete('/del/:referance', deleteArticleByReference);
articleRoute.put('/put/:referance', updateArticleByReference);

module.exports = articleRoute;
