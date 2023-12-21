const client = require('../database/modules/client')
module.exports={
   getClient: async (req, res) => {
        try {
          const allClients = await client.find({}); 
          res.json(allClients); 
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      },


      addClient: async (req, res) => {
        try {
          await client.save(req.body); 
          res.json("client succesfully added"); 
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }


}