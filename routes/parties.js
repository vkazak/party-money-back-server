const router = require('express').Router();
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;

router.route('/by_user/:userId').get((req, res) => {
    const userId = ObjectId(req.params.userId);
    Party.find({users: userId})
        .then(parties => res.json(parties))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const name = req.body.name;

    const newParty = new Party({ name });

    newParty.save()
       .then(() => res.json(newParty))
       .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/addmembers').post((req, res) => {
    const partyId = ObjectId(req.body.partyId);
    const rawUsersIds = req.body.usersIds;
    const rawDummiesIds = req.body.dummiesIds;
    
    const usersIds = rawUsersIds ? rawUsersIds.map(id => ObjectId(id)) : [];
    const dummiesIds = rawDummiesIds ? rawDummiesIds.map(id => ObjectId(id)) : [];

    console.log(usersIds);
    console.log(dummiesIds);

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