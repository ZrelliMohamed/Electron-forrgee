const express = require('express')
const factureRouter = express.Router()
const {addFacture,getNextFactureNumber} = require('../controller/Facture')


factureRouter.post('/add',addFacture)
factureRouter.get('/next',getNextFactureNumber)




module.exports=factureRouter