import { ipcMain } from 'electron';
import Client from '../database/modules/client';
export function handleFournisseurIPC(mainWindow) {

/*-------------------------------------- Create one Fournisseur------------------------------------------*/

ipcMain.on('Fourn:add', async (event, FournToAdd) => {
  try {
    // Add the 'type' property to the FournToAdd object
    FournToAdd.type = 'Fournisseur'; // Set the type to 'Fournisseur'

    let cli = new Client(FournToAdd);
    await cli.save();
    mainWindow.webContents.send("Fourn:succes", "Fournisseur successfully added");
  } catch (err) {
    mainWindow.webContents.send("Fourn:failer", { message: err.message });
  }
});

 /*-------------------------------------- Get All Fournisseur------------------------------------------*/
 ipcMain.on('Fourn:getAll', async (event, msg) => {
  try {
    const clientType = 'Fournisseur'; // Define the type 'Fournisseur'
    const allClients = await Client.find({ type: clientType });

    // Serialize the ObjectId fields in each document to strings
    const serializedClients = allClients.map(Fournisseur => ({
      ...Fournisseur.toObject(), // Convert Mongoose document to plain object
      _id: Fournisseur._id.toString(), // Serialize ObjectId to string
    }));
    mainWindow.webContents.send('Fourn-reply', serializedClients);
  } catch (err) {
    mainWindow.webContents.send('Fourn-reply:err', { message: err.message });
  }
});

 /*-------------------------------------- Get one Fournisseur------------------------------------------*/
 ipcMain.on('Fournisseur:getOne', async (event, referance) => {
  try {
    let oneFournisseur = await Client.findOne({ referance: referance, type: 'Fournisseur' });
    if (!oneFournisseur) {
      mainWindow.webContents.send("Fournisseur:getOne:ref?", { message: "Fournisseur not found" });
    }
    if (oneFournisseur) {
      const FournisseurToSend = {
        ...oneFournisseur.toObject(),
        _id: oneFournisseur._id.toString(),
      };
      mainWindow.webContents.send("Fournisseur:getOne:succes", FournisseurToSend);
    }
  } catch (err) {
    mainWindow.webContents.send("Fournisseur:getOne:err", { message: err.message });
  }
});














}
