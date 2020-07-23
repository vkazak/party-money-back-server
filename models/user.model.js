const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        externalId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            trim: true,
            required: true
        },
        email: {
            type: String,
            trim: true
        },
        photoUrl: {
            type: String
        },
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        dummies: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Dummy' }]
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;