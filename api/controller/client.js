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
          let cli = new client(req.body)
          await cli.save(); 
          res.json("client succesfully added"); 
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      },

      deleteClientByReferance: async (req, res) => {
        const { referance } = req.params;

        try {
            const deletedClient = await client.findOneAndDelete({ referance: referance });
            if (!deletedClient) {
                return res.status(404).json({ message: "Client not found" });
            }
            res.json({ message: "Client successfully deleted", deletedClient });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    updateClientByReference: async (req, res) => {
      const { referance } = req.params;

      try {
          const updatedClient = await client.findOneAndUpdate(
              { referance: referance },
              { $set: req.body },
              { new: true }
          );

          if (!updatedClient) {
              return res.status(404).json({ message: "Client not found" });
          }

          res.json({ message: "Client successfully updated", updatedClient });
      } catch (err) {
          res.status(500).json({ message: err.message });
      }
  },
  getOneClient: async (req, res) => {
    const { referance } = req.params;

    try {
      const oneClient = await client.findOne({ referance: referance });
      if (!oneClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(oneClient);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }



}