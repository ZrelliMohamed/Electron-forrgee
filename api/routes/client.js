const express = require('express')
const {addClient,getClient} = require('../controller/client')
const clientRoute=express.Router()
clientRoute.get('/get',getClient);
clientRoute.post('/add',addClient);
module.exports=clientRoute
