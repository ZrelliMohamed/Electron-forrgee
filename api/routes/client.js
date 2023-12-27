const express = require('express')
const {addClient,getClient,deleteClientByReferance,updateClientByReference,getOneClient} = require('../controller/client')
const clientRoute=express.Router()
clientRoute.get('/getOne/:referance',getOneClient);
clientRoute.get('/get',getClient);
clientRoute.post('/add',addClient);
clientRoute.delete('/del/:referance',deleteClientByReferance);
clientRoute.put('/put/:referance',updateClientByReference);

module.exports=clientRoute
