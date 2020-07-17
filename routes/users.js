const router = require('express').Router();
const User = require('../models/user.model');
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/by_party/:partyId').get((req, res) => {
    const partyId = ObjectId(req.params.partyId);

    Party.findById(partyId)
        .populate('users')
        .then(party => res.json(party.users))
        .catch(err => res.status(400).json('Error: ' + err))
})

router.route('/add').post((req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    const newUser = new User({ name, email });

    newUser.save()
        .then(() => res.json(newUser))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;