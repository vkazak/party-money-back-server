const router = require('express').Router();
const Payment = require('../models/payment.model');

router.route('/add').post((req, res) => {
    const partyId = req.body.partyId;
    const userId = req.body.userId;
    const amount = Number(req.body.amount);
    const description = req.body.description;

    const newPayment = new Payment({user: userId, party: partyId, amount, description});

    newPayment.save()
        .then((payment) => res.json(payment))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/by_party/:partyId').get((req, res) => {
    const partyId = req.params.partyId;

    Payment.find({party: partyId})
        .populate('user')
        .then(payment => res.json(payment))
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;