const express = require('express')
const factureRouter = express.Router()
const {addFacture,getNextFactureNumber,getAllFactures,deleteFactureById} = require('../controller/Facture')


factureRouter.post('/add',addFacture)
factureRouter.get('/next',getNextFactureNumber)
factureRouter.get('/all',getAllFactures)
factureRouter.delete('/:id',deleteFactureById)




module.exports=factureRouter