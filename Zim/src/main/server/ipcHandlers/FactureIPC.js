import Facture from "../database/modules/Facture";
import Variable from "../database/modules/variable";
import { ipcMain } from 'electron';

export function handleFactureIPC(mainWindow) {
/*-------------------------------------- Get Facture Setting ------------------------------------------*/
ipcMain.on('Facture:Setting',async (event, msg) => {
  try {
    // Find the first document in the collection
    const document = await Variable.findOne({});
    let documentToSend
    if (!document) {

      // Create a new document using the model (it will use default values from the schema)
      document = await Variable.create({});
         documentToSend = {
        ...document.toObject(),
        _id: document._id.toString(),
       };
      mainWindow.webContents.send('Facture:Setting-reply', { documentToSend });
  }
   documentToSend = {
    ...document.toObject(),
    _id: document._id.toString(),
  };
  mainWindow.webContents.send('Facture:Setting-reply', { documentToSend });
} catch (err) {
    mainWindow.webContents.send('Facture:Setting:err', { message: err.message });
}
})

/*-------------------------------------- Get Next Facture Number ------------------------------------------*/
ipcMain.on('Facture:nextNumero',async (event, msg) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Find the document with the highest Numero for the current year
    const latestFacture = await Facture.findOne({
      Numero: { $regex: new RegExp(`\\/${currentYear}$`, 'i') } // Match the year in Numero
    }).sort({ Numero: -1 }).limit(1);

    let count = 1; // Default count if no matching document found
    if (latestFacture) {
      const latestNumero = latestFacture.Numero.split('/')[0]; // Extract count from Numero
      count = parseInt(latestNumero, 10) + 1; // Increment the count by 1
    }

    const formattedCount = String(count).padStart(6, '0'); // Pad with leading zeros
    const nextFactureNumber = `${formattedCount}/${currentYear}`;
    mainWindow.webContents.send('Facture:nextNumero-reply', { nextFactureNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
    mainWindow.webContents.send('Facture:nextNumero:err', { message: err.message });
  }
})
/*-------------------------------------- Create One Facture ------------------------------------------*/

ipcMain.on('Facture:create',async(event,facture)=> {
  try {
    let newFacture = new Facture(facture);
    await newFacture.save();
    mainWindow.webContents.send('Facture:create:succes', "Facture successfully Created");
} catch (err) {
    mainWindow.webContents.send('Facture:create:err', { message: err.message });
}
})

/*-------------------------------------- Delete Facture One Facture ------------------------------------------*/

ipcMain.on('Facture:Delete',async(event,factureID)=> {
  try {
    await Facture.findByIdAndDelete(factureID);
    mainWindow.webContents.send('Facture:Delete:succes', "Facture successfully Deleted");
} catch (err) {
    mainWindow.webContents.send('Facture:Delete:err', { message: err.message });
}
})

/*-------------------------------------- Get All Factures ------------------------------------------*/

ipcMain.on('Facture:GetAll',async(event,msg)=> {
try {
  const allFactures = await Facture.find({})
      .populate('client'); // Populate the 'client' field assuming it's the reference to the client collection

      const facturesWithClientDetails = allFactures.map(facture => {
        const clientDetails = facture.client;
        const factureIdAsString = facture._id.toString();
        const clientIdAsString = clientDetails._id.toString();

        // Manipulate the date format
        const date = new Date(facture.DateFacture);

        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Adding 1 because getMonth returns 0-11
        const day = date.getDate();

        // Create a custom date format
        const customDateFormat = `${year}-${month}-${day}`;

        return {
          ...facture.toObject(),
          _id: factureIdAsString,
          DateFacture: customDateFormat, // Updated date format
          client: {
            ...clientDetails.toObject(),
            _id: clientIdAsString
          }
        };
      });

      console.log('here', facturesWithClientDetails[0].DateFacture);
      mainWindow.webContents.send('Facture:GetAll:succes', { factures: facturesWithClientDetails });
} catch (err) {
  mainWindow.webContents.send('Facture:GetAll:err', { message: err.message });
}
})
/*-------------------------------------- Update Facture Setting ------------------------------------------*/

ipcMain.on('Facture:Setting:update',async (event, newSetting) => {
  try {
    // Find the first document in the collection and update it with the provided data
    await Variable.findOneAndUpdate(
        {},
        { $set: newSetting },
        { new: true }
    );
    mainWindow.webContents.send('Facture:Setting:succes',{ message: 'Document updated successfully'});
} catch (err) {
    mainWindow.webContents.send('Facture:Setting:err', { message: err.message });
}


})


}

