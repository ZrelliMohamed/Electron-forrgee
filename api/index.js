const express = require('express')
const cors = require('cors')
const db = require('./database/index')
const clientRouter=require('./routes/client')
const articleRouter=require('./routes/article')
const factureRouter = require('./routes/Facture')
const vriableRouter=require('./routes/variable') 
const Variable = require('./database/modules/variable')
const app = express()
app.use(cors()) // Allow cross-origin requests
app.use(express.json()) 

const initializeSettings = async () => {
    try {
        const settingsCount = await Variable.countDocuments({});
        if (settingsCount === 0) {
            // If no Variable exist, create one
            const createdSettings = await Variable.create({});
            console.log('Variable document created:', createdSettings);
        }
    } catch (err) {
        console.error(err);
    }
};


app.use('/clients',clientRouter)
app.use('/factures',factureRouter)
app.use('/article',articleRouter)
app.use('/setting',vriableRouter)
app.listen(443,async()=>{
    try {
        await initializeSettings();
        console.log('Variable initialization complete.');
        console.log("Server is running on port 443")
    } catch (err) {
        console.error('Error initializing Variable:', err);
    }
})




