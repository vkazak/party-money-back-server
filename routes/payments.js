const router = require('express').Router();
const Payment = require('../models/payment.model');

router.route('/add').post(async (req, res) => {
    const party = req.body.partyId;
    const user = req.body.userId;
    const dummy = req.body.dummyId;
    const forUsers = req.body.forUsersIds;
    const forDummies = req.body.forDummiesIds;
    const amount = Number(req.body.amount);
    const description = req.body.description;

    const newPayment = new Payment({user, dummy, party, forUsers, forDummies, amount, description});
    
    try {
        await newPayment.save();
        Payment.findById(newPayment._id)
            .populate('user')
            .populate('dummy')
            .populate('forUsers')
            .populate('forDummies')
            .then(payment => res.json(payment))
    } catch(err) {
        res.status(400).json('Error: ' + err)
    }
});

router.route('/by_party/:partyId').get((req, res) => {
    const partyId = req.params.partyId;

    Payment.find({party: partyId})
        .populate('user')
        .populate('dummy')
        .populate('forUsers')
        .populate('forDummies')
        .then(payment => res.json(payment))
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;