const router = require('express').Router();
const Payment = require('../models/payment.model');
const Party = require('../models/party.model');
const ObjectId = require('mongoose').Types.ObjectId;

const getSumForPayments = (payments) => {
    const sumFunc = (acc, payment) => acc + Number(payment.amount);
    return ( payments.reduce(sumFunc, 0) );
}

const getSumForMember = (payments, memberId, isDummy) => {
    const isMember = (payment) => {
        let result;
        if (isDummy) {
            result = payment.dummy ? payment.dummy.toString() == memberId.toString() : false;
        } else {
            result = payment.user ? payment.user.toString() == memberId.toString() : false;
        }
        return result;
    }

    const sumFunc = (acc, payment) => {
        return (
            acc + (isMember(payment) ? Number(payment.amount) : 0)
        );
    };
    
    return ( payments.reduce(sumFunc, 0) );
}

const calculateDebts = (payments, usersIds, dummiesIds) => {
    const sum = getSumForPayments(payments);
    const members = usersIds.length + dummiesIds.length;
    const amountPerPerson = sum / members;
    const plusGuys = []
    const minusGuys = [];
    
    const distribute = (memberIds, isDummy) => {
        memberIds.forEach(memberId => {
            const sumForMember = getSumForMember(payments, memberId, isDummy);
            if (sumForMember > amountPerPerson) {
                plusGuys.push({ memberId, isDummy, amount: sumForMember - amountPerPerson });
            }
            else {
                minusGuys.push({ memberId, isDummy, amount: amountPerPerson - sumForMember });
            }
        });
    }

    distribute(usersIds, false);
    distribute(dummiesIds, true);

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

    const pushResult = (minusGuy, plusGuy, amount) => {
        result.push({
            from: {
                id: minusGuy.memberId,
                isDummy: minusGuy.isDummy
            },
            to: {
                id: plusGuy.memberId,
                isDummy: plusGuy.isDummy
            },
            amount
        })
    }

    plusGuys.forEach(plusGuy => {
        while (plusGuy.amount > EPS) {
            const minusGuy = minusGuyIter.next().value;
            const minValue = Math.min(plusGuy.amount, minusGuy.amount);
            if (minValue < EPS) throw 'ERROR minValue < EPS'
            plusGuy.amount -= minValue;
            minusGuy.amount -= minValue;
            pushResult(minusGuy, plusGuy, minValue);
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
    let currentParty;
    Party.findById(partyId)
        .then(party => {
            currentParty = party;
            return ( Payment.find({party: partyId}) )
        })
        .then(payments => res.json(calculateDebts(payments, currentParty.users, currentParty.dummies)))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;