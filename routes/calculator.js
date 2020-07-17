const router = require('express').Router();
const Payment = require('../models/payment.model');
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;

const getSumForPayments = (payments) => {
    const sumFunc = (acc, payment) => acc + Number(payment.amount);
    return ( payments.reduce(sumFunc, 0) );
}

const getSumForUser = (payments, userId) => {
    const sumFunc = (acc, payment) => acc + 
        (payment.user.toString() == userId.toString() ? Number(payment.amount) : 0);
    return ( payments.reduce(sumFunc, 0) );
}

const calculateDebts = (payments, usersIds) => {
    const sum = getSumForPayments(payments);
    const amountPerPerson = sum / usersIds.length;
    const plusGuys = []
    const minusGuys = [];

    usersIds.forEach(userId => {
        const sumForUser = getSumForUser(payments, userId);
        if (sumForUser > amountPerPerson) {
            plusGuys.push({userId: userId, amount: sumForUser - amountPerPerson});
        }
        else {
            minusGuys.push({userId: userId, amount: amountPerPerson - sumForUser});
        }
    });

    const compareDesc = (a, b) => b.amount - a.amount;
    plusGuys.sort(compareDesc);
    minusGuys.sort(compareDesc);

    const EPS = 0.001;
    const result = [];

    function *MinusGuysIter() {
        let idx = 0;

        while (idx < minusGuys.length) {
            yield minusGuys[idx];
            if (minusGuys[idx].amount < EPS) idx++;
        }
    }

    const minusGuyIter = MinusGuysIter();

    plusGuys.forEach(plusGuy => {
        while (plusGuy.amount > EPS) {
            const minusGuy = minusGuyIter.next().value;
            const minValue = Math.min(plusGuy.amount, minusGuy.amount);
            if (minValue < EPS) throw 'ERROR minValue < EPS'
            plusGuy.amount -= minValue;
            minusGuy.amount -= minValue;
            result.push({ from: minusGuy.userId, to: plusGuy.userId, amount: minValue });
        }
    });

    if (getSumForPayments(plusGuys) > EPS || getSumForPayments(minusGuys) > EPS) {
        console.log(plusGuys);
        console.log(minusGuys);
        throw "ERROR CALC";
    }

    return {
        spent: sum,
        perPerson: amountPerPerson,
        debts: result
    }
}

router.route('/debts/:partyId').get((req, res) => {
    const partyId = ObjectId(req.params.partyId);
    console.log(partyId);
    let currentParty;
    Party.findById(partyId)
        .then(party => {
            currentParty = party;
            return ( Payment.find({party: partyId}) )
        })
        .then(payments => res.json(calculateDebts(payments, currentParty.users)))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;