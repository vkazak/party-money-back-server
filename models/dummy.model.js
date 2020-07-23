const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dummySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Dummy = mongoose.model('Dummy', dummySchema);

module.exports = Dummy;