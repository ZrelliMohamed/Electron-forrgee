// ipcHandlers.js

import { ipcMain } from 'electron';
import Client from '../database/modules/client';
export function handleClientIPC(mainWindow) {
 /*-------------------------------------- Get All CLient------------------------------------------*/
ipcMain.on('Client', async (event, msg) => {
  try {
    const allClients = await Client.find({});

    // Serialize the ObjectId fields in each document to strings
    const serializedClients = allClients.map(client => ({
      ...client.toObject(), // Convert Mongoose document to plain object
      _id: client._id.toString(), // Serialize ObjectId to string
    }));
    mainWindow.webContents.send('Client-reply', serializedClients);
  } catch (err) {
    mainWindow.webContents.send('Client-reply:err', { message: err.message });
  }
});

/*-------------------------------------- Create one CLient------------------------------------------*/

ipcMain.on('Client:add',async(event,clientToAdd)=> {
  try {
    let cli = new Client(clientToAdd)
    await cli.save();
    mainWindow.webContents.send("Client:succes","client successfully added");
  } catch (err) {
    mainWindow.webContents.send("Client:failer",{ message: err.message });
  }

})
/*-------------------------------------- Delete CLient------------------------------------------*/


ipcMain.on('Client:delete', async (event, referance) => {
  try {
    const deletedClient = await Client.findOneAndDelete({ referance: referance });
    if (!deletedClient) {
      mainWindow.webContents.send("DeleteClient:ref?",{ message: "Client not found" });
    }
    mainWindow.webContents.send("DeleteClient:succes",{ message: "Client successfully deleted"});
  } catch (err) {
    mainWindow.webContents.send("DeleteClient:err",{ message: err.message});
  }
});
/*-------------------------------------- Update Client-----------------------------------------*/

ipcMain.on('Client:Update', async (event, client) => {
  try {
    const updatedClient = await Client.findOneAndUpdate(
      { referance: client.referance },
      { $set: client },
      { new: true }
    );
    if (!updatedClient) {
      // return res.status(404).json({ message: "Client not found" });
      mainWindow.webContents.send("UpdateClient:ref?",{ message: "Client not found" });
    }
    // res.json({ message: "Client successfully updated", updatedClient });
    mainWindow.webContents.send("UpdateClient:succes",{ message: "Client successfully updated"});
  } catch (err) {
    mainWindow.webContents.send("UpdateClient:err",{ message: err.message});
  }

})

/*-------------------------------------- Get One Client -----------------------------------------*/

ipcMain.on('Client:getOne', async (event, referance) => {
  try {
    let oneClient = await Client.findOne({ referance: referance });
    if (!oneClient) {
      mainWindow.webContents.send("Client:getOne:ref?",{ message: "Client not found" });
    }
    oneClient._id=oneClient._id.toString()
    const clientToSend = {
      ...oneClient.toObject(),
      _id: oneClient._id.toString(),
  };
    mainWindow.webContents.send("Client:getOne:succes",clientToSend);
  } catch (err) {
    mainWindow.webContents.send("Client:getOne:err",{ message: err.message });
  }




})





}
