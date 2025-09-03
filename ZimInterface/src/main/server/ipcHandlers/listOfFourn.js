import { ipcMain } from 'electron';
import Client from '../database/modules/client';
export function listOfFourn(mainWindow, createNewOnglet) {
  let newOnglet
  ipcMain.on('CreateFournList', async (event, msg) => {
    try {
      newOnglet= createNewOnglet('FournList.html',1110,800)
    } catch (err) {
      console.log(err);
    }
  });
  ipcMain.on('FournList', async (event, msg) => {
    try {
      const clientType = 'Fournisseur'; // Define the type 'Fournisseur'
      const allClients = await Client.find({ type: clientType });

      // Serialize the ObjectId fields in each document to strings
      const serializedClients = allClients.map(Fournisseur => ({
        ...Fournisseur.toObject(), // Convert Mongoose document to plain object
        _id: Fournisseur._id.toString(), // Serialize ObjectId to string
      }));
      newOnglet.webContents.send('FournList-reply', serializedClients);
    } catch (err) {
      newOnglet.webContents.send('FournList-reply:err', { message: err.message });
    }
  });

  ipcMain.on('Fourn:choosed', async (event, msg) => {
    try {
      console.log(msg);
      mainWindow.webContents.send('ChoosedFourn',msg)
      newOnglet.close()
    } catch (err) {
      console.log(err);
    }
  });


}
