const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
    referance: { type: Number, unique: true },
    clientName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: [Number],required: true },
    address: { type: String, required: true },
    MF: String,
    fax: Number,
    exonere: { type: Boolean }
});

// Pre-save middleware to auto-increment 'referance' field
ClientSchema.pre('save', async function (next) {
    try {
        if (!this.isNew) {
            return next(); // If not a new document, do nothing
        }

        const maxClient = await this.constructor.findOne({}, { referance: 1 }).sort({ referance: -1 });

        if (maxClient && maxClient.referance >= 0) {
            this.referance = maxClient.referance + 1;
        } else {
            this.referance = 512001; // If no existing clients, start with 0
        }

        return next();
    } catch (error) {
        return next(error);
    }
});

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
