const express = require('express');
require('express-async-errors');
const yaml = require('yamljs');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const constants = require('./configs/constants');
const redis = require('./services/redis.service.js');
const config = require('./configs/config');
const services = require('./services/createAbha.service');
const {getKeyBasedOnEntityName, getMockProfile} = require("./services/abhaProfile.service");
const app = express();
(async() => {
    await redis.initRedis({REDIS_URL: config.REDIS_URL})
})();

app.use(bodyParser.urlencoded({extended: false, limit: '500kb'}));
app.use((bodyParser.json({limit: '500kb'})));

if (config.LOG_LEVEL === "DEBUG") {
    axios.interceptors.request.use(request => {
        console.log('Starting Request', JSON.stringify(request, null, 2))
        return request
    })

    axios.interceptors.response.use(response => {
        console.log('Response:', response)
        return response
    })
}

app.post('/auth/sendOTP', async(req, res) => {
    res.status(200).json({});
    return;
});

app.post('/auth/verifyOTP', async(req, res) => {
    const mockProfile = getMockProfile();
    res.status(200).json(mockProfile);
    return;
});

const getRegisteredCount = async(key) => {
    const value = await redis.getKey(key);
    return ((value === null ? 0 : parseInt(value)) + 1) + "";
}

app.get('/health', async(req, res) => {
    res.status(200).send({status: 'UP'});
});

async function generateNottoId(entityName) {
    const year = new Date().getFullYear().toString().substring(2);
    const registrationCategory = getKeyBasedOnEntityName(entityName);
    if (registrationCategory === null) {
        throw new Error(`Entity ${entityName} not supported`)
    }
    const registered = await getRegisteredCount(registrationCategory);
    return registrationCategory + year + (registered + "").padStart(parseInt(config.NUMBER_OF_DIGITS), '0');
}

async function incrementNottoId(entityName) {
    const registrationCategory = getKeyBasedOnEntityName(entityName);
    if (registrationCategory === null) {
        throw new Error(`Entity ${entityName} not supported`)
    }
    await redis.increment(registrationCategory);
}

app.post('/register/:entityName', async(req, res) => {
    console.log('Inviting entity');
    let profile = req.body;
    profile.personalDetails.photo = getMockProfile().profilePhoto;
    profile.personalDetails.gender = constants.GENDER_MAP[getMockProfile().gender];
    const entityName = req.params.entityName;
    try {
        profile.identificationDetails.nottoId = await generateNottoId(entityName);
        const inviteReponse = (await axios.post(`${config.REGISTRY_URL}/api/v1/${entityName}/invite`, profile)).data;
        await incrementNottoId(entityName);
        const abha = profile.identificationDetails.abha;
        await redis.storeKey(getKeyBasedOnEntityName(entityName) + abha, "true");
        res.send(inviteReponse);
    } catch(err) {
        console.error(err);
        err = {
            message: err?.response?.data || err?.message
        }
        res.status(500).json(err);
    }
});

app.put('/register/:entityName/:entityId', async(req, res) => {
    console.log('Inviting entity');
    let profileFromReq = req.body;
    profileFromReq = JSON.parse(JSON.stringify(profileFromReq).replace(/\:null/gi, "\:\"\""));
    const entityName = req.params.entityName;
    const entityId = req.params.entityId;
    const userData = JSON.parse(await getUserData(getKeyBasedOnEntityName(entityName) + entityId, req));
    try {
        if(validateIfNonEditableFieldsPresent(profileFromReq, userData)) {
            throw {error: 'You can only modify Pledge details or Emergency Contact Details'};
        }
        const updateApiResponse = (await axios.put(`${config.REGISTRY_URL}/api/v1/${entityName}/${entityId}`, profileFromReq, {headers: {...req.headers}})).data;
        await redis.deleteKey(getKeyBasedOnEntityName(entityName) + entityId);
        res.send(updateApiResponse);
    } catch(err) {
        console.error(err);
        err = {
            message: err?.response?.data || err?.message || err
        }
        res.status(500).json(err);
    }
});

app.delete('/:entityName/:entityId/', async (req, res) => {
    try {
        const entityName = req.params.entityName;
        const entityId = req.params.entityId;
        let userData = JSON.parse(await getUserData(getKeyBasedOnEntityName(entityName) + entityId, req));
        userData.pledgeDetails.organs = [];
        userData.pledgeDetails.tissues = [];
        console.log(userData)
        const updateApiResponse = (await axios.put(`${config.REGISTRY_URL}/api/v1/${entityName}/${entityId}`,
            userData,
            {headers: {Authorization: req.headers.authorization}})).data;
        res.status(200).json(updateApiResponse);
    } catch (e) {
        console.error(e)
        res.status(500).json(e);
    }
});

app.post('/esign/init', async (req, res) => {
    res.send({
        signUrl: config.ESIGN_FORM_SIGN_URL,
        aspTxnId: 'mockAspTxnId'
    });
    return;
});

const getUserData = async(key, req) => {
    let userData = await redis.getKey(key);
    if(userData !== null) {
        return userData;
    }
    userData = (await axios.get(`${config.REGISTRY_URL}/api/v1/${req.params.entityName}/${req.params.entityId}`, {headers: {...req.headers}})).data;
    await redis.storeKeyWithExpiry(key, JSON.stringify(userData), 2 * 24 * 60 * 60);
    return JSON.stringify(userData);
}

app.post('/mock/esign', (req, res) => {
    const html = `<html><head><title>Mock ESign</title></head><body><h3>This is Mock ESIGN Portal</h3><a href=${config.ESIGN_ESP_URL}>Submit</a></body></html>`
    res.send(html);
})

app.get('/mock/esign/submit', async(req, res) => {
    await redis.storeKeyWithExpiry('mockAspTxnId', "true", config.EXPIRE_PROFILE);
    res.sendStatus(200)
})

app.put('/esign/init/:entityName/:entityId', async(req, res) => {
    res.send({
        signUrl: 'http://localhost:3000/mock/esign',
        aspTxnId: 'mockAspTxnId'
    });
});

function validateIfNonEditableFieldsPresent(reqData, userData) {
    const partiallyEditablePersonalDetails = Object.keys(userData.personalDetails).filter(key => !(['motherName', 'middleName', 'bloodGroup', 'emailId', 'photo', 'osUpdatedAt', 'osUpdatedBy'].includes(key)));
    const partiallyEditableAddressDetails = Object.keys(userData.addressDetails).filter(key => !(['addressLine2', 'osUpdatedBy', 'osUpdatedAt'].includes(key)));
    let result = !(userData.identificationDetails.abha === reqData.identificationDetails.abha && userData.identificationDetails.nottoId === reqData.identificationDetails.nottoId);
    for(const key of partiallyEditablePersonalDetails) {
        result = result || !(userData.personalDetails[key] === reqData.personalDetails[key]);
    }
    if(result) return result;
    for(const key of partiallyEditableAddressDetails) {
        result = result || !(userData.addressDetails[key] === reqData.addressDetails[key]);
    }
    return result;
}

async function getESingDoc(abha) {
    if((await redis.getKey('mockAspTxnId')) === "true") {
        await redis.deleteKey('mockAspTxnId');
        return Promise.resolve({message: "SUCCESS"})
    }
    return Promise.reject({message: "NOT GENERATED"});
}

app.get('/esign/:abha/status', async (req, res) => {
    console.log("Get status api called")
    try {
        await getESingDoc(req.params.abha)
            .then(function (response) {
                res.send({message: "SUCCESS"})
            })
            .catch(function (error) {
                console.error(error)
                res.status(404).send({message: "NOT GENERATED"})
            });
    } catch (e) {
        // console.error(e)
        res.status(404).send({message: "NOT GENERATED"})
    }
});

app.post('/auth/mobile/sendOTP', async(req, res) => {
    res.status(200).json({txnId: "123"});
    return;
});


app.post('/auth/mobile/verifyOTP', async(req, res) => {
    res.status(200).json({
        mobileLinkedHid: [
            {
            healthIdNumber: '91-3075-5157-3552',
            healthId: '',
            name: 'John Doe',
            profilePhoto: null,
            phrAddress: null
            }
        ]
        });
    return;
});

app.post('/abha/profile', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    res.send(getMockProfile());
    return;
});

app.post('/abha/registration/aadhaar/generateOtp', (req, res) => services.generateAadhaarOTP(req, res));
app.post('/abha/registration/aadhaar/verifyOtp', (req, res) => services.verifyAadhaarOTP(req, res));

app.use(function(err, req, res, next) {
    console.error("Error occurred for ")
    console.error("URL: ", req.url)
    if (config.LOG_LEVEL === "DEBUG") {
        console.error("BODY: ", req.body)
        console.error("HEADERS: ", req.headers)
    }
    console.error(err)
    res.status(500).send({
        status: "error",
        message: "Internal server error"
    })
});
app.listen('3000');
