const Variable = require('../database/modules/variable');

module.exports = {
    updateAllField: async (req, res) => {
        try {
            const newData = req.body; // Assuming req.body contains all the data to update

            // Find the first document in the collection and update it with the provided data
            const updatedVariable = await Variable.findOneAndUpdate(
                {},
                { $set: newData },
                { new: true }
            );

            if (!updatedVariable) {
                return res.status(404).json({ message: 'No document found to update.' });
            }

            res.json({ message: 'Document updated successfully', variable: updatedVariable });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getDocument: async (req, res) => {
        try {
            // Find the first document in the collection
            const document = await Variable.findOne({});

            if (!document) {
                return res.status(404).json({ message: 'No document found.' });
            }

            res.json({ document });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};