import mongoose from "mongoose";

const FactureAchat = mongoose.Schema({
  Numero: { type: String, required: true },
  DateFacture: { type: Date, required: true },
  Fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  InvoiceData: { type: Object, required: true },
  Etat:{ type : Boolean , default :false}
})

const FacAchat = mongoose.model('Facture', FactureAchat);
export default FacAchat;
