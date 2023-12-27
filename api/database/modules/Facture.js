const mongoose = require("mongoose");
const client = require('./client');

const FactureSchema = new mongoose.Schema({
    Numero: { type: String },
    DateFacture: { type: Date, required: true },
    Nbc: { type: String, default: '' },
    articles: { type: [Object], required: true },
    totalcalcul: { type: Object, required: true },
    netAPayer: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }
});

// Pre-save middleware to generate the Numero based on year and count
FactureSchema.pre('save', async function (next) {
    const currentDate = new Date(this.DateFacture);
    const currentYear = currentDate.getFullYear();

    if (!this.Numero) {
        // Find the count of documents for the current year
        const count = await this.constructor.countDocuments({
            DateFacture: {
                $gte: new Date(`${currentYear}-01-01`),
                $lte: new Date(`${currentYear}-12-31T23:59:59`)
            }
        });

        // Generate the Numero based on the count for the current year
        const formattedCount = String(count + 1).padStart(6, '0'); // Pad with leading zeros
        this.Numero = `${formattedCount}/${currentYear}`;
    }

    next();
});

const Facture = mongoose.model('Facture', FactureSchema);
module.exports = Facture;
