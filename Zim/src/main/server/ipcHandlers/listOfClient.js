import { ipcMain } from 'electron';
import Client from '../database/modules/client';
export function listOfClient(mainWindow, createNewOnglet) {
  let newOnglet
  ipcMain.on('CreateClientList', async (event, msg) => {
    try {
      newOnglet= createNewOnglet('ClientList.html',1110,800)
    } catch (err) {
      console.log(err);
    }
  });

  ipcMain.on('ClientList', async (event, msg) => {
    try {
      console.log('heere');
      const clientType = 'Client'; // Define the type 'Client'
      const allClients = await Client.find({ type: clientType });

      // Serialize the ObjectId fields in each document to strings
      const serializedClients = allClients.map(client => ({
        ...client.toObject(), // Convert Mongoose document to plain object
        _id: client._id.toString(), // Serialize ObjectId to string
      }));
      newOnglet.webContents.send('ClientList-reply', serializedClients);
    } catch (err) {
      newOnglet.webContents.send('ClientList-reply:err', { message: err.message });
    }
  });
  ipcMain.on('Client:choosed', async (event, msg) => {
    try {
      console.log(msg);
      mainWindow.webContents.send('ChoosedClient',msg)
      newOnglet.close()
    } catch (err) {
      console.log(err);
    }
  });

}

