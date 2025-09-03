import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Client', 'Fournisseur'], // Only allows 'Client' or 'Fournisseur'
        required: true
    },
    referance: { type: Number, unique: true },
    clientName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: [Number], required: true },
    address: { type: String, required: true },
    MF: String,
    fax: Number,
});

ClientSchema.pre('save', async function (next) {
    try {
        if (!this.isNew) {
            return next(); // If not a new document, do nothing
        }
        const startReference = this.type === 'Client' ? 512001 : 522001;
        const maxClient = await this.constructor.findOne({ type: this.type }, { referance: 1 }).sort({ referance: -1 });
        if (maxClient && maxClient.referance >= startReference) {
            this.referance = maxClient.referance + 1;
        } else {
            this.referance = startReference; // Set initial reference based on type
        }
        return next();
    } catch (error) {
        return next(error);
    }
});

const Client = mongoose.model('Client', ClientSchema);
export default Client;
