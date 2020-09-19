const router = require('express').Router();
const Dummy = require('../models/dummy.model');
const User = require('../models/user.model');
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../middleware/auth');

router.route('/add').post(auth.validateUserIdAsBodyParam, (req, res) => {
    const name = req.body.name;
    const userId = req.body.userId;
    const newDummy = new Dummy({ name });

    newDummy.save()
        .then(() => User.findById(userId))
        .then(user => {
            user.dummies.push(newDummy);
            user.save();
            res.json(newDummy)
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/by_user/:userId').get(auth.validateUserIdAsGetParam, (req, res) => {
    const userId = ObjectId(req.params.userId);
    User.findById(userId)
        .populate('dummies')
        .then(user => res.json(user.dummies))
        .catch(err => res.status(400).json('Error: ' + err));
});

// TODO -- any user can get dummies of any party
router.route('/by_party/:partyId').get(auth.validateUser, (req, res) => {
    const partyId = ObjectId(req.params.partyId);
    
    Party.findById(partyId)
        .populate('dummies')
        .then(party => res.json(party.dummies))
        .catch(err => res.status(400).json('Error: ' + err))
})

module.exports = router;