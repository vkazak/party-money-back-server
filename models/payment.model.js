const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
    {
        party: {
            type: Schema.Types.ObjectId,
            ref: 'Party',
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            min: 0,
            required: true
        },
        description: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;