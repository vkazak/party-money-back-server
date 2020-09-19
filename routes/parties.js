const router = require('express').Router();
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../middleware/auth');

router.route('/by_user/:userId').get(auth.validateUserIdAsGetParam, (req, res) => {
    const userId = ObjectId(req.params.userId);
    Party.find({users: userId})
        .then(parties => res.json(parties))
        .catch(err => res.status(400).json('Error: ' + err));
});
//TODO -- any user can add party with any list of dummies and users
router.route('/add').post(auth.validateUser, (req, res) => {
    const name = req.body.name;
    const rawUsersIds = req.body.users;
    const rawDummiesIds = req.body.dummies;
    const users = rawUsersIds ? rawUsersIds.map(id => ObjectId(id)) : [];
    const dummies = rawDummiesIds ? rawDummiesIds.map(id => ObjectId(id)) : [];
    const newParty = new Party({ name, users, dummies });

    newParty.save()
       .then(() => res.json(newParty))
       .catch(err => res.status(400).json('Error: ' + err));
});
//TODO -- any user can add members to any party
router.route('/addmembers').post(auth.validateUser, (req, res) => {
    const partyId = ObjectId(req.body.partyId);
    const rawUsersIds = req.body.usersIds;
    const rawDummiesIds = req.body.dummiesIds;
    
    const usersIds = rawUsersIds ? rawUsersIds.map(id => ObjectId(id)) : [];
    const dummiesIds = rawDummiesIds ? rawDummiesIds.map(id => ObjectId(id)) : [];

    Party.findById(partyId)
        .then((party) => {
            party.users = party.users.concat(usersIds);
            party.dummies = party.dummies.concat(dummiesIds);
            party.save();
            res.end();
        })
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;