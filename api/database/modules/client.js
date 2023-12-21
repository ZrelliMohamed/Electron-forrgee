const  mongoose  = require("mongoose");
const clt = new mongoose.Schema({
    clientName: {type :String , required: true},
    email:{type :String , required: true},
    phoneNumber: { type: [Number] },
    address: String,
    MF:String,
    fax:Number
  });
  const client = mongoose.model('Client', clt);
  module.exports=client;


 
