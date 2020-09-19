const router = require('express').Router();
const User = require('../models/user.model');
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../middleware/auth');

router.route('/').get(auth.validateUser, (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});
// TODO -- any user can get users list of any party
router.route('/by_party/:partyId').get(auth.validateUser, (req, res) => {
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
// TODO 
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
            return userToInsert
        })
        .then(userToInsert => userToInsert.save())
        .then(updatedUser => res.json(updatedUser))
        .catch(err => console.log(err))        
});

router.route('/by_token').get(auth.validateUser, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    User.findById(await auth.sessions.getUserIdByToken(token))
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;