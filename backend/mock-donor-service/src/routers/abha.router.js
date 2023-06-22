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
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAstWB95C5pHLXiYW59qyO
4Xb+59KYVm9Hywbo77qETZVAyc6VIsxU+UWhd/k/YtjZibCznB+HaXWX9TVTFs9N
wgv7LRGq5uLczpZQDrU7dnGkl/urRA8p0Jv/f8T0MZdFWQgks91uFffeBmJOb58u
68ZRxSYGMPe4hb9XXKDVsgoSJaRNYviH7RgAI2QhTCwLEiMqIaUX3p1SAc178ZlN
8qHXSSGXvhDR1GKM+y2DIyJqlzfik7lD14mDY/I4lcbftib8cv7llkybtjX1Aayf
Zp4XpmIXKWv8nRM488/jOAF81Bi13paKgpjQUUuwq9tb5Qd/DChytYgBTBTJFe7i
rDFCmTIcqPr8+IMB7tXA3YXPp3z605Z6cGoYxezUm2Nz2o6oUmarDUntDhq/PnkN
ergmSeSvS8gD9DHBuJkJWZweG3xOPXiKQAUBr92mdFhJGm6fitO5jsBxgpmulxpG
0oKDy9lAOLWSqK92JMcbMNHn4wRikdI9HSiXrrI7fLhJYTbyU3I4v5ESdEsayHXu
iwO/1C8y56egzKSw44GAtEpbAkTNEEfK5H5R0QnVBIXOvfeF4tzGvmkfOO6nNXU3
o/WAdOyV3xSQ9dqLY5MEL4sJCGY1iJBIAQ452s8v0ynJG5Yq+8hNhsCVnklCzAls
IzQpnSVDUVEzv17grVAw078CAwEAAQ==
-----END PUBLIC KEY-----
`)
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