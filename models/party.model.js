const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        dummies: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Dummy' }]
        },
        users: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User'}]
        }
    },
    {
        timestamps: true
    },
);

const Party = mongoose.model('Party', partySchema);

module.exports = Party;