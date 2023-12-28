const Facture = require('../database/modules/Facture')
module.exports={
    addFacture: async (req, res) => {
        try {
            let newFacture = new Facture(req.body);
            await newFacture.save();
            res.json("Facture successfully added");
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getNextFactureNumber : async (req, res) => {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
    
            // Find the document with the highest Numero for the current year
            const latestFacture = await Facture.findOne({
                Numero: { $regex: new RegExp(`\\/${currentYear}$`, 'i') } // Match the year in Numero
            }).sort({ Numero: -1 }).limit(1);
    
            let count = 1; // Default count if no matching document found
            if (latestFacture) {
                const latestNumero = latestFacture.Numero.split('/')[0]; // Extract count from Numero
                count = parseInt(latestNumero, 10) + 1; // Increment the count by 1
            }
    
            const formattedCount = String(count).padStart(6, '0'); // Pad with leading zeros
            const nextFactureNumber = `${formattedCount}/${currentYear}`;
    
            res.json({ nextFactureNumber });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    deleteFactureById: async (req, res) => {
        try {
            const factureId = req.params.id;
            await Facture.findByIdAndDelete(factureId);
            res.json({ message: 'Facture deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getAllFactures: async (req, res) => {
    try {
        const allFactures = await Facture.find({})
            .populate('client'); // Populate the 'client' field assuming it's the reference to the client collection

        const facturesWithClientDetails = allFactures.map(facture => {
            // Assuming 'client' holds the client details after populating
            const clientDetails = facture.client;
            // Modify the facture object to include client details
            return {
                ...facture.toObject(), // Convert Mongoose document to plain JavaScript object
                client: clientDetails // Replace 'client' with actual client details
            };
        });

        res.json({ factures: facturesWithClientDetails });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


}