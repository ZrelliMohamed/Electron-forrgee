const express = require('express')
const cors = require('cors')
const db = require('./database/index')
const clientRouter=require('./routes/client')
const articleRouter=require('./routes/article')
const factureRouter = require('./routes/Facture')
const app = express()
app.use(cors()) // Allow cross-origin requests
app.use(express.json()) 
app.use('/clients',clientRouter)
app.use('/factures',factureRouter)
app.use('/article',articleRouter)
app.listen(443,()=>{
    console.log("Server is running on port 443")
})




