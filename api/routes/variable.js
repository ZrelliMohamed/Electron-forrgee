const express = require('express')
const router = express.Router()
const {getDocument,updateAllField}= require('../controller/variable')


router.get('/',getDocument)
router.put('/put',updateAllField)




module.exports=router