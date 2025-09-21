import { ipcMain } from 'electron';
import Article from '../database/modules/article'

export function listOfArticles(mainWindow, createNewOnglet) {
/* ---------------------- Open Articles Picker window ---------------------- */
let picker;
ipcMain.on('Articles:openPicker', async (_event) => {
    try {
         picker = createNewOnglet('ArticlesPicker.html', 900, 700, 'Catalogue des articles');
    } catch (error) {
        console.log(error);
    }
});

 /*-------------------------------------- Get All Articles------------------------------------------*/
 ipcMain.on('ArticlesPicker:all', async (event, msg) => {
  try {
    const allArticles = await Article.find({});
    const serializedArticles = allArticles.map(article => ({
      ...article.toObject(), // Convert Mongoose document to plain object
      _id: article._id.toString(), // Serialize ObjectId to string
    }));
    picker.webContents.send('Articles-reply:Picker', serializedArticles);
  } catch (err) {
    picker.webContents.send('Articles-reply:err:Picker', { message: err.message });
  }
});

  /* ------------- Receive chosen article from picker and forward ------------ */
  ipcMain.on('ArticlesPicker:choose', (_event, pickedArticle) => {
    try {
      // Forward to the main window (the invoice UI)
      mainWindow.webContents.send('Invoice:articlePicked', pickedArticle);

      // Optionally close the picker after choosing
      if (picker && !picker.isDestroyed()) {
        picker.close();
      }
    } catch (err) {
      console.error('Failed to forward picked article:', err);
    }
  });




}
