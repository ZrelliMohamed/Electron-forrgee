import mongoose from "mongoose";

const FactureSchema = new mongoose.Schema({
  Numero: { type: String },
  DateFacture: { type: Date, required: true },
  Nbc: { type: String, default: '' },
  dateBC: {type : Date , default : null},
  articles: { type: [Object], required: true },
  totalcalcul: { type: Object, required: true },
  netAPayer: { type: String, required: true },
  exonere: { type: Object },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }
});

// Pre-save middleware to generate the Numero based on year and count
FactureSchema.pre('save', async function (next) {
  const currentDate = new Date(this.DateFacture);
  const currentYear = currentDate.getFullYear();

  if (!this.Numero) {
    // Find the document with the highest Numero for the current year
    const latestFacture = await this.constructor
      .findOne({
        Numero: { $regex: new RegExp(`\\/${currentYear}$`, 'i') } // Match the year in Numero
      })
      .sort({ Numero: -1 }) // Sort in descending order to get the highest Numero
      .limit(1);

    let count = 1; // Default count if no matching document found
    if (latestFacture) {
      const latestNumero = latestFacture.Numero.split('/')[0]; // Extract count from Numero
      count = parseInt(latestNumero, 10) + 1; // Increment the count by 1
    }

    const formattedCount = String(count).padStart(6, '0'); // Pad with leading zeros
    this.Numero = `${formattedCount}/${currentYear}`;
  }

  next();
});


const Facture = mongoose.model('Facture', FactureSchema);
export default Facture;
