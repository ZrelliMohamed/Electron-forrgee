const express = require('express')
const db = require('./database/index')
const clientRouter=require('./routes/client')
const app = express()
app.use(express.json()) 
app.use('/clients',clientRouter)
app.listen(443,()=>{
    console.log("Server is running on port 443")
})




