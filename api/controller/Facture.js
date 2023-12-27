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
    getNextFactureNumber: async (req, res) => {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();

            // Find the count of documents for the current year
            const count = await Facture.countDocuments({
                DateFacture: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lte: new Date(`${currentYear}-12-31T23:59:59`)
                }
            });

            // Generate the next invoice number based on the count for the current year
            const formattedCount = String(count + 1).padStart(6, '0'); // Pad with leading zeros
            const nextFactureNumber = `${formattedCount}/${currentYear}`;

            res.json({ nextFactureNumber });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

}