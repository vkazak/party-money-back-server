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

const googleUserInfoToUse = (userInfo) => {
    const user = new User({
        externalId: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        photoUrl: userInfo.photoUrl,
        firstName: userInfo.givenName,
        lastName: userInfo.familyName,
    });

    return user;
}

router.route('/google_user_upd').post((req, res) => {
    const userInfo = req.body.userInfo;
    const user = googleUserInfoToUse(userInfo);

    User.findOne({ externalId: user.externalId })
        .then(userInDb => {
            const userToInsert = user;
            if (userInDb) {
                userToInsert.dummies = userInDb.dummies;
                userToInsert.isNew = false;
                userToInsert._id = userInDb._id;
            }
            else {
                userToInsert.dummies = [];
            }
            console.log(userToInsert);
            return userToInsert
        })
        .then(userToInsert => userToInsert.save())
        .then(updatedUser => res.json(updatedUser))
        .catch(err => console.log(err))        
});

module.exports = router;