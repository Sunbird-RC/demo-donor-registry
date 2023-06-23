const express = require('express');
const abhaRouter = express.Router()
const {v4: uuidv4} = require('uuid');
const {getRandomMockProfile, isMockProfilePresent} = require('../services/mock-profile.service');

let uuidAbhaMap = new Map();
let userTokenTxnIdMap = new Map();
abhaRouter.post('/v1/auth/init', (req, res) => {
    if(isMockProfilePresent(req.body.healthid)) {
        const txnId = uuidv4();
        console.log('txnId', txnId);
        const healthId = req.body.healthid;
        uuidAbhaMap.set(txnId, healthId);
        res.send({
            txnId: txnId
        });
        return;
    }
    res.status(500).send({
        "details": [{
            "code": "HIS-1008"
        }]
    })
    return;
});

abhaRouter.get('/v2/auth/cert', (req, res) => {
    res.send(`-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0DpgK6ZjfCfRfLYNyeCy
AQEcMEDvwSW12IoQlbjFSDOEH4mZmHXIBhXNQ4MAlNP+Q95sNtnsY3ueO5Zcs14B
S7yfEQdWbMQUQkjANHHM6rR5d74kQibkaxl+IhlT/waX8obzGVhpBivvskSTbsYv
ViWBr1B3I/KcaU+SHx7GM6Bto5+MSIN62TKtKvaHmUIfZfmMIuvClnpxQrWv8kb0
DMorQvgnWZ0JvRliZs43GzGzF3RRaMWM5paQVZnTGYfICNQQU+YCLOtFBOrYjrHr
PsSlIb/OwxyOak10k9Su7wE998KxPVxshScRF75rRx18fBawAvJf0+gmOH3GqAhD
F/VIMG8oEbW2OOYsd/o3ByVpdXxTnqoSpUuMpPFTAkPChEwG9uVQZd7FH2ApNTwt
ozM2bf1xJPLdmpOEh4/ArE4/RBLrz3rrfueQXIRH4gmJ0ZjFtNxNv411Jqa0ekfB
eD4NCbd7fQnV00VbH90TzgQVHQuMYkt8H9MPUadJpxUwwgWI91FRU7mxXbDcACIb
and+tcEAiwuRgsZLRaD32ME1/XBy9m+xoBQe1ekfuKw0UXIwW43yYoVMPfY3LCNc
1IiZ0vWsF0oiMO0lc+vJcK7vr9FSEVeXDYG01Ic06ja4dp1hQ5/HJUDyoeHjGnur
U0l1rSM3GzdtvP+T/Mk3uzMCAwEAAQ==
-----END PUBLIC KEY-----`)
})

abhaRouter.post('/v1/auth/confirmWithMobileOTP', (req, res) => {
    const passedTxnId = req.body.txnId
    const txnId = uuidv4();
    console.log('txnId : ', txnId);
    userTokenTxnIdMap.set(txnId, passedTxnId)
    res.send({
        "token": txnId
    });
});

abhaRouter.get('/v1/account/profile', (req, res) => {
    const abha = uuidAbhaMap.get(userTokenTxnIdMap.get(req.headers['x-token'].substring(7)));
    const profile = getRandomMockProfile(abha);
    res.send(profile);
});

abhaRouter.post('/v2/registration/mobile/login/generateOtp', (req, res) => {
    res.send({
        txnId: "123"
    })
});

abhaRouter.post('/v2/registration/mobile/login/verifyOtp', (req, res) => {
    res.send({
        "mobileLinkedHid": [
            {
                "healthIdNumber": "91-3075-5157-3552",
                "healthId": "",
                "name": "John Doe",
                "profilePhoto": null,
                "phrAddress": null,
                "pledged": false
            }
        ]
    })
});

abhaRouter.post('/v2/registration/mobile/login/userAuthorizedToken', (req, res) => {
    res.send({
        token: "asdasdas"
    })
});

abhaRouter.post('/v2/registration/aadhaar/generateOtp', (req, res) => {
    res.send({});
});

abhaRouter.post('/v2/registration/aadhaar/verifyOTP', (req, res) => {
    res.send({...getRandomMockProfile(), jwtResponse: {token: '123'}});
});

module.exports = {
    abhaRouter
}