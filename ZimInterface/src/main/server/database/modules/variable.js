import mongoose from "mongoose";

const Vari = new mongoose.Schema({
    Tva: { type: Number, default: 19},
    fodec:{type: Number, default: 1},
    timbreFiscal:{type: Number, default: 0.7},
})

const Variable = mongoose.model('Variable', Vari);
export default Variable;
