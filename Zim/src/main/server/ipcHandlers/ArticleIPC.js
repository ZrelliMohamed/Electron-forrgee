import { ipcMain } from 'electron';
import Article from '../database/modules/article'

export function handleArticleIPC(mainWindow) {
 /*-------------------------------------- Get All Articles------------------------------------------*/
 ipcMain.on('Articles', async (event, msg) => {
  try {
    const allArticles = await Article.find({});
    const serializedArticles = allArticles.map(article => ({
      ...article.toObject(), // Convert Mongoose document to plain object
      _id: article._id.toString(), // Serialize ObjectId to string
    }));
    mainWindow.webContents.send('Articles-reply', serializedArticles);
  } catch (err) {
    mainWindow.webContents.send('Articles-reply:err', { message: err.message });
  }
});
/*-------------------------------------- Create one Articles------------------------------------------*/

ipcMain.on('Article:add',async(event,ArticleToAdd)=> {
  try {
    const { referance } = ArticleToAdd;
    // Check if an article with the same reference already exists
    const existingArticle = await Article.findOne({ referance });

    if (existingArticle) {
        mainWindow.webContents.send("Article:add:ref?",{ message: "Article with the same reference already exists" });
    }

    let newArticle = new Article(ArticleToAdd);
    await newArticle.save();
    mainWindow.webContents.send("Article:add:succes","Article successfully added");
} catch (err) {
  mainWindow.webContents.send("Article:add:failer",{ message: err.message });
}
})
/*-------------------------------------- Delete Articles------------------------------------------*/
ipcMain.on('Article:delete', async (event, referance) => {
  try {
    const deletedArticle = await Article.findOneAndDelete({ referance: referance });
    if (!deletedArticle) {
      mainWindow.webContents.send("Delete:Article:ref?",{ message: "Article not found" });
    }
    mainWindow.webContents.send("Delete:Article:succes",{ message: "Article successfully deleted"});
  } catch (err) {
    mainWindow.webContents.send("Delete:Article:err",{ message: err.message});
  }
});

/*-------------------------------------- Update Article-----------------------------------------*/

ipcMain.on('Article:Update', async (event, article) => {
  try {
    const updatedArticle = await Article.findOneAndUpdate(
      { referance: article.referance },
      { $set: article },
      { new: true }
    );
    if (!updatedArticle) {
      mainWindow.webContents.send("Update:Article:ref?",{ message: "Article not found" });
    }
    mainWindow.webContents.send("Update:Article:succes",{ message: "Article successfully updated"});
  } catch (err) {
    mainWindow.webContents.send("Update:Article:err",{ message: err.message});
  }

})

/*-------------------------------------- Get One Article-----------------------------------------*/

ipcMain.on('Article:getOne', async (event, referance) => {
  try {
    const article = await Article.findOne({ referance: referance });
    if (!article) {
      mainWindow.webContents.send("Article:getOne:ref?",{ message: "Article not found" });
    }
    const articleToSend = {
      ...article.toObject(),
      _id: article._id.toString(),
     };
     console.log(articleToSend);
     mainWindow.webContents.send('Article:getOne:succes', articleToSend);

} catch (err) {
    mainWindow.webContents.send("Article:getOne:err",{ message: err.message });
}





})






}



