const express = require('express');
require('express-async-errors');
const yaml = require('yamljs');
const sharp = require('sharp');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const https = require('https');
const qs = require('qs');
const FormData = require('form-data');
const redis = require('./services/redis.service');
const {getAbhaApisAccessToken} = require('./services/sessions.service')
const config = require('./configs/config');
const constants = require('./configs/constants');
const SERVICE_ACCOUNT_TOKEN = "SERVICE_ACCOUNT_TOKEN";
const R = require('ramda');
const {sendNotification} = require("./services/notify.service");
const {LOGIN_LINK, INVITE_TEMPLATE_ID, NOTIFY_TEMPLATE_ID, UPDATE_TEMPLATE_ID, UNPLEDGE_TEMPLATE_ID} = require("./configs/config");
const {encryptWithCertificate} = require("./services/encrypt.service");
const services = require('./services/createAbha.service');
const profileService = require('./services/abhaProfile.service');
const utils = require('./utils/utils');
const {isABHARegistered, getKeyBasedOnEntityName, getPledgeStatus} = require("./services/abhaProfile.service");
const {PLEDGE_STATUS, GENDER_MAP, SOCIAL_SHARE_TEMPLATE_MAP} = require('./configs/constants')
const app = express();
const {convertToSocialShareResponse} = require("./utils/utils");

(async() => {
    await redis.initRedis({REDIS_URL: config.REDIS_URL})
})();

const swaggerDocs = yaml.load('./abha-swagger.yaml');
app.use(bodyParser.urlencoded({extended: false, limit: '500kb'}));
app.use((bodyParser.json({limit: '500kb'})));

app.use('/api-docs', swagger.serve, swagger.setup(swaggerDocs));

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

const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

const getProfileFromUserAndRedis = (profileFromReq, profileFromRedis) => {
    const profile = {...profileFromReq};
    profile.personalDetails.firstName = profileFromRedis.firstName;
    profile.personalDetails.lastName = profileFromRedis.lastName;
    if(profileFromRedis.middleName !== "") {
        profile.personalDetails.middleName = profileFromRedis.middleName;
    }
    if(profileFromRedis.fatherName && profileFromRedis.fatherName !== "") {
        profile.personalDetails.fatherName = profileFromRedis.fatherName;
    }
    profile.personalDetails.dob = (`${profileFromRedis.yearOfBirth}-${String(profileFromRedis.monthOfBirth).padStart(2, '0')}-${String(profileFromRedis.dayOfBirth).padStart(2, '0')}`);
    profile.personalDetails.gender = GENDER_MAP[profileFromRedis.gender] || "Male";
    profile.personalDetails.photo = profileFromRedis.profilePhoto || "";
    profile.addressDetails.state = toTitleCase(profileFromRedis.stateName) || "";
    profile.addressDetails.district = profileFromRedis.districtName || "";
    profile.addressDetails.pincode = profileFromRedis.pincode || "";
    profile.identificationDetails.abha = String(profileFromRedis.healthIdNumber).replace(/-/g, '');
    return profile;
}

app.post('/auth/sendOTP', async(req, res) => {
    console.log('sending OTP');
    const clientSecretToken = await getAbhaApisAccessToken();
    const abhaId = req.body.healthId;
    //TODO:get method from frontend
    const method = 'MOBILE_OTP';
    try {
        await checkABHAIsUnique(abhaId);
        const otpSendResponse = (await axios.post(`${config.BASE_URL}/v1/auth/init`, {"authMethod": method, "healthid": abhaId},
            {headers: {Authorization: 'Bearer '+clientSecretToken}})).data;
        res.send(otpSendResponse);
        console.log('OTP sent');
    } catch(err) {
        const error = utils.getErrorObject(err);
        res.status(err.status || 500).send(error);
    }
});

app.post('/auth/verifyOTP', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    const transactionId = req.body.transactionId;
    const otp = req.body.otp;
    let pledgeStatusToSend;
    const clientSecretToken = await getAbhaApisAccessToken();
    try {
        const verifyOtp = (await axios.post(`${config.BASE_URL}/v1/auth/confirmWithMobileOTP`, {
            "otp": otp,
            "txnId": transactionId
        }, {headers: {Authorization: 'Bearer ' + clientSecretToken}})).data;
        console.debug('OTP verified', verifyOtp);
        const userToken = verifyOtp.token;
        const profile = await profileService.getAndCacheEKYCProfile(clientSecretToken, userToken);
        if (R.pathOr("", ["healthIdNumber"], profile) !== "") {
            let checkABHA = await isABHARegistered(profile.healthIdNumber, true);
            if (checkABHA) {
                await utils.checkForPledgeStatusAndReturnError(profile.healthIdNumber)
            }
        }
        res.status(200).send(profile);
        console.log('Sent Profile KYC');
    } catch(err) {
        console.error(err);
        let error = utils.getErrorObject(err)
        res.status(error.status).send(error);
    }
});


const getRegisteredCount = async(key) => {
    const value = await redis.getKey(key);
    return ((value === null ? 0 : parseInt(value)) + 1) + "";
}

async function sendRegisteredNotifications(profile) {
    if (R.pathOr("", ["personalDetails", "mobileNumber"], profile).length > 0) {
        await sendNotification(profile.personalDetails.mobileNumber, "Congratulations!\\n" +
            "You've successfully pledged for organs/tissues donation.\\n" +
            `You can login now to view and download pledge certificate ${LOGIN_LINK}.\\n` +
            "\\n" +
            "NOTTO, NHA", INVITE_TEMPLATE_ID);
    }
    const notifyName = R.pathOr("", ["notificationDetails", "name"], profile);
    const notifyNumber = R.pathOr("", ["notificationDetails", "mobileNumber"], profile);
    if (notifyName.length > 0 && notifyNumber.length > 0) {
        await sendNotification(notifyNumber, `Dear Mr/Ms ${notifyName},\\n` +
            `This is to inform you that Mr/Ms ${profile.personalDetails.firstName} ${profile.personalDetails.middleName} ${profile.personalDetails.lastName} has pledged for Organ/Tissue donation.\\n` +
            "\\n" +
            "To know more about the NOTTO visit notto.gov.in.\\n" +
            "\\n" +
            "NOTTO, NHA", NOTIFY_TEMPLATE_ID);
    }
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
    //TODO : check duplicate
    const profileFromRedis = JSON.parse(await redis.getKey(req.body.identificationDetails.abha));
    if(profileFromRedis === null) {
        res.status(401).send({message: 'Abha number verification expired. Please refresh the page and restart registration'});
        return;
    }
    let profileFromReq = req.body;
    profileFromReq = JSON.parse(JSON.stringify(profileFromReq).replace(/\:null/gi, "\:\"\""));
    const profile = getProfileFromUserAndRedis(profileFromReq, profileFromRedis);
    const entityName = req.params.entityName;
    try {
        profile.identificationDetails.nottoId = await generateNottoId(entityName);
        const inviteReponse = (await axios.post(`${config.REGISTRY_URL}/api/v1/${entityName}/invite`, profile)).data;
        await incrementNottoId(entityName);
        const abha = profileFromReq.identificationDetails.abha;
        await redis.storeKey(getKeyBasedOnEntityName(entityName) + abha, PLEDGE_STATUS.PLEDGED); // 0 ---> pledged 
        const osid = inviteReponse.result[entityName].osid;
        const esignFileData = (await getESingDoc(abha)).data;
        const uploadESignFileRes = await uploadESignFile(osid, esignFileData);
        console.log(uploadESignFileRes);
        await sendRegisteredNotifications(profile);

        res.send(inviteReponse);
    } catch(err) {
        console.error(err);
        err = {
            message: err?.response?.data || err?.message
        }
        res.status(500).json(err);
    }
});

async function sendUpdatedNotification(userData) {
    await sendNotification(userData.personalDetails.mobileNumber, `Dear Mr/Ms ${userData.personalDetails.firstName},\\n` +
        `Congratulations!\\n`+
        `You've successfully edited the pledge for organs/tissues donation.\\n` +
        `You can login now to view and download pledge certificate ${LOGIN_LINK}.\\n` +
        "NOTTO, NHA", UPDATE_TEMPLATE_ID);
}

async function sendNotificationToEmergencyDetailsIfUpdated(profileFromReq, userData) {
    if (validateEmergencyMobileNumberUpdated(profileFromReq, userData)) {
        const notifyName = R.pathOr("", ["notificationDetails", "name"], profileFromReq);
        const notifyNumber = R.pathOr("", ["notificationDetails", "mobileNumber"], profileFromReq);
        await sendNotification(notifyNumber, `Dear Mr/Ms ${notifyName},\\n` +
            `This is to inform you that Mr/Ms ${profileFromReq.personalDetails.firstName} ${profileFromReq.personalDetails.middleName} ${profileFromReq.personalDetails.lastName} has pledged for Organ/Tissue donation.\\n` +
            "\\n" +
            "To know more about the NOTTO visit notto.gov.in.\\n" +
            "\\n" +
            "NOTTO, NHA", NOTIFY_TEMPLATE_ID);
    }
}

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
        const esignFileData = (await getESingDoc(profileFromReq.identificationDetails.abha)).data;
        const uploadESignFileRes = await uploadESignFile(entityId, esignFileData);
        await redis.storeKey(getKeyBasedOnEntityName(entityName) + profileFromReq?.identificationDetails?.abha, PLEDGE_STATUS.PLEDGED);
        console.log(uploadESignFileRes);
        await sendUpdatedNotification(userData);
        await sendNotificationToEmergencyDetailsIfUpdated(profileFromReq, userData);
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

async function sendUnpledgeNotification(userData) {
    await sendNotification(userData.personalDetails.mobileNumber, `Dear Mr/Ms ${userData.personalDetails.firstName},\\n` +
        `Congratulations!\\n`+
        `You've successfully unpledged for organs/tissues donation.\\n` +
        "NOTTO, NHA", UNPLEDGE_TEMPLATE_ID);
}

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
        await redis.storeKey(
            getKeyBasedOnEntityName(entityName) + userData.identificationDetails.abha, 
            PLEDGE_STATUS.UNPLEDGED
        ); // 1 ---> unpledged 
        //TODO 
        // use the revoke API from S_RC core
        await sendUnpledgeNotification(userData)
        res.status(200).json(updateApiResponse);
    } catch (e) {
        console.error(e)
        res.status(500).json(e);
    }
});

app.get('/certs/share/:entityName/:entityId/template/:templateId', async(req, res) => {
    const entityName = req.params.entityName;
    const entityId = req.params.entityId;
    const templateId = req.params.templateId;
    try {
        const token = await getServiceAccountToken();
        const userDataString = await getUserData(getKeyBasedOnEntityName(entityName) + entityId, {
            ...req,
            headers: {
                ...req.headers,
                'Content-Type': "application/json",
                'Accept': "*/*",
                'Authorization': `Bearer ${token}`,
            }
        });
        const userData = JSON.parse(userDataString);
        const responseData = convertToSocialShareResponse(entityName, userData);
        const templateUrl = R.path([entityName, templateId], SOCIAL_SHARE_TEMPLATE_MAP);
        if(!templateUrl) {
            throw new Error(`template for '${entityName}' with id '${templateId}' not found`);
        }
        const svg = (await axios.post(`${config.CERTIFICATE_API_URL}/api/v1/certificate`, {
            entityId: `share/${entityName}/${entityId}/template/${templateId}`,
            entityName,
            templateUrl,
            certificate: JSON.stringify(responseData)
        },{
            headers: {
            Accept: "image/svg+xml",
            "Content-Type": "application/json"
        }})).data;
        const pngBuffer = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();
        res.contentType("image/png").send(pngBuffer);
    } catch(err) {
        console.error(err);
        err = {
            message: err?.response?.data || err?.message || err
        }
        res.status(500).json(err);
    }
});


function validateEmergencyMobileNumberUpdated(profileFromReq, userData) {
    const userNotifyNumber = R.pathOr("", ["notificationDetails", "mobileNumber"], userData);
    const reqNotifyNumber = R.pathOr("", ["notificationDetails", "mobileNumber"], profileFromReq);
    return userNotifyNumber !== reqNotifyNumber && reqNotifyNumber !== "";
}

app.post('/esign/init', async (req, res) => {
    try {
        // if (!'data' in req.query) {
        //     res.status(400).send(new Error('Pledge data not available'));
        // }
        console.log(req.query)
        // const pledge = JSON.parse(req.query.data)
        const pledge = req.body.data;
        const esignData = await getEsignData(pledge);
        res.send({
            signUrl: esignData.espUrl,
            xmlContent: esignData.xmlContent,
            aspTxnId: esignData.txnId,
        })
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }

});

const getEsignData = async(pledge) => {
    const data = JSON.stringify({
        "document": {
            "integratorName": "NOTTO_DONOR_REGISTRY",
            "templateId": "TEMPLATE_1",
            "submitterName": "TarunL",
            "signingPlace": "Delhi",
            "identification": {
                "abha": R.pathOr("", ["identificationDetails", "abha"], pledge)
            },
            "personaldetails": {
                "firstName": R.pathOr("", ["personalDetails", "firstName"], pledge),
                "middleName": R.pathOr("", ["personalDetails", "middleName"], pledge),
                "lastName": R.pathOr("", ["personalDetails", "lastName"], pledge),
                "fatherName": R.pathOr("", ["personalDetails", "fatherName"], pledge),
                "motherName": R.pathOr("", ["personalDetails", "motherName"], pledge),
                "dob": R.pathOr("", ["personalDetails", "dob"], pledge),
                "gender": R.pathOr("", ["personalDetails", "gender"], pledge),
                "bloodGroup": R.pathOr("", ["personalDetails", "bloodGroup"], pledge),
                "emailId": R.pathOr("", ["personalDetails", "emailId"], pledge),
                "mobileNumber": R.pathOr("", ["personalDetails", "mobileNumber"], pledge),
            },
            "addressdetails": {
                "addressLine1": R.pathOr("", ["addressDetails", "addressLine1"], pledge),
                "addressLine2": R.pathOr("", ["addressDetails", "addressLine2"], pledge),
                "country": R.pathOr("", ["addressDetails", "country"], pledge),
                "state": R.pathOr("", ["addressDetails", "state"], pledge),
                "district": R.pathOr("", ["addressDetails", "district"], pledge),
                "pincode": R.pathOr("", ["addressDetails", "pincode"], pledge),
            },
            "pledgedetails": {
                "organs": R.pathOr([], ["pledgeDetails", "organs"], pledge),
                "tissues": R.pathOr([], ["pledgeDetails", "tissues"], pledge),
                "other": R.pathOr("", ["pledgeDetails", "other"], pledge)
            },
            "emergencydetails": {
                "name": R.pathOr("", ["emergencyDetails", "name"], pledge),
                "relation": R.pathOr("", ["emergencyDetails", "relation"], pledge),
                "mobileNumber": R.pathOr("", ["emergencyDetails", "mobileNumber"], pledge)
            },
            "notificationdetails": {
                "name": R.pathOr("", ["notificationDetails", "name"], pledge),
                "relation": R.pathOr("", ["notificationDetails", "relation"], pledge),
                "mobileNumber": R.pathOr("", ["notificationDetails", "mobileNumber"], pledge)
            },
            "instituteReference": R.pathOr("", ["instituteReference"], pledge),
            "consent": true,
            "sorder": 0
        }
    })
    let apiKey = config.API_KEY
    const apiResponse = await axios.request({
        method: 'post',
        url: config.ESIGN_ESP_URL,
        maxBodyLength: Infinity,
        headers: {
            'Content-Type': 'application/json',
            'apikey': `${apiKey}`
        
        }, 
        data: data,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    let xmlContent = apiResponse.data.espRequest;
    await redis.storeKeyWithExpiry(getEsginKey(pledge.identificationDetails.abha), apiResponse.data.aspTxnId, config.EXPIRE_PROFILE)
    return {xmlContent: xmlContent, txnId: apiResponse.data.aspTxnId, espUrl: apiResponse.data.espUrl};
}

const getUserData = async(key, req) => {
    let userData = await redis.getKey(key);
    if(userData !== null) {
        return userData;
    }
    userData = (await axios.get(`${config.REGISTRY_URL}/api/v1/${req.params.entityName}/${req.params.entityId}`, {headers: {...req.headers}})).data;
    await redis.storeKeyWithExpiry(key, JSON.stringify(userData), 2 * 24 * 60 * 60);
    return JSON.stringify(userData);
}

app.put('/esign/init/:entityName/:entityId', async(req, res) => {
    try {
        const userData = JSON.parse(await getUserData(getKeyBasedOnEntityName(req.params.entityName) + req.params.entityId, req));
        if(validateIfNonEditableFieldsPresent(req.body.data, userData)) {
            throw {error: 'You can only modify Pledge details or Emergency Contact Details'};
        }
        const esignData = await getEsignData(req.body.data);
        res.send({
            signUrl: esignData.espUrl,
            xmlContent: esignData.xmlContent,
            aspTxnId: esignData.txnId,
        })
    } catch(err) {
        console.log(err);
        res.status(500).json(err?.response?.data ||err?.message || err);
    }
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

function getEsginKey(abha) {
    return `${abha}-esign`;
}

async function uploadESignFile(pledgeOsid, fileBytes) {
    const data = new FormData();
    data.append('files', Buffer.from(fileBytes), {filename: '.pdf'});
    const response = await axios({
        method: 'post',
        url: `${config.REGISTRY_URL}/api/v1/Pledge/${pledgeOsid}/esign/documents`,
        headers: {
            'Authorization': `Bearer ${await getServiceAccountToken()}`,
            ...data.getHeaders()
        },
        data: data
    })
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
    console.log(response);
    return response;
}


async function getServiceAccountToken() {
    const token = await redis.getKey(SERVICE_ACCOUNT_TOKEN);
    if (token === null) {

        const response = await axios({
            method: 'post',
            url: `${config.KEYCLOAK_URL}/auth/realms/sunbird-rc/protocol/openid-connect/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({
                'grant_type': 'client_credentials',
                'client_id': 'donor-service',
                'client_secret': config.SERVICE_ACCOUNT_CLIENT_SECRET
            })
        })
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        await redis.storeKeyWithExpiry(SERVICE_ACCOUNT_TOKEN, response.access_token, response.expires_in)
        return response.access_token;
    }
    return token;
}

async function getESingDoc(abha) {
    let eSingTransactionId = await redis.getKey(getEsginKey(abha));
    console.log("Get status api called" + eSingTransactionId)
    return axios({
        method: 'get',
        url: config.ESIGN_ESP_PDF_URL.replace(':transactionId', eSingTransactionId),
        responseEncoding: 'binary',
        responseType: 'arraybuffer',
        headers: {
            'apikey': `${config.API_KEY}`,
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    })
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
    console.log('sending OTP');
    const clientSecretToken = await getAbhaApisAccessToken();
    const mobile = req.body.mobile;
    try {
        const otpSendResponse = (await axios.post(`${config.BASE_URL}/v2/registration/mobile/login/generateOtp`,
            {"mobile": mobile},
            {headers: {Authorization: 'Bearer '+clientSecretToken}})).data;
        res.send(otpSendResponse);
        console.log('OTP sent');
    } catch(err) {
        console.error(err);
        let error = utils.getErrorObject(err);
        res.status(error.status).send(error);
    }
});


app.post('/auth/mobile/verifyOTP', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    const transactionId = req.body.transactionId;
    const otp = req.body.otp;
    const clientSecretToken = await getAbhaApisAccessToken();
    try {
        const encryptedOtp = await encryptWithCertificate(otp);

        const verifyOtpResponse = (await axios.post(`${config.BASE_URL}/v2/registration/mobile/login/verifyOtp`, {
            "otp": encryptedOtp,
            "txnId": transactionId
        }, {headers: {Authorization: 'Bearer ' + clientSecretToken}})).data;
        console.debug('OTP verified', verifyOtpResponse);
        if (R.pathOr([], ["mobileLinkedHid"], verifyOtpResponse).length > 0) {
            for (const data of verifyOtpResponse.mobileLinkedHid) {
                let abhaRegistered = await isABHARegistered(data.healthIdNumber, true)
                data["pledged"] = abhaRegistered
                if (abhaRegistered) {
                    let pledgeStatus = await getPledgeStatus(data.healthIdNumber)
                    data["pledgeStatus"] = pledgeStatus 
                } else {
                    data["pledgeStatus"] = PLEDGE_STATUS.NOTPLEDGED // New User 
                }
            }
        }
        res.send(verifyOtpResponse);
    } catch(err) {
        console.error(err);
        let error = utils.getErrorObject(err);
        res.status(error.status).send(error);
    }
});


async function checkABHAIsUnique(abhaId) {
    if (await isABHARegistered(abhaId)) {
        throw {
            status: 409,
            message: 'Entered ABHA number is already registered as pledger. Please login to view and download pledge certificate'
        };
    }
}

async function getUserAuthorizedToken(healthId, txnId, token, clientSecretToken) {
    return (await axios.post(`${config.BASE_URL}/v2/registration/mobile/login/userAuthorizedToken`, {
        healthId,
        txnId
    }, {headers: {Authorization: `Bearer ${clientSecretToken}`, 'T-Token': `Bearer ${token}`}})).data;
}

app.post('/abha/profile', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    const transactionId = req.body.transactionId;
    const healthId = req.body.healthId;
    const profileToken = req.body.token;
    const clientSecretToken = await getAbhaApisAccessToken();
    try {
        await checkABHAIsUnique(healthId)
        const userToken = (await getUserAuthorizedToken(healthId, transactionId, profileToken, clientSecretToken)).token;
        const profile = await profileService.getAndCacheEKYCProfile(clientSecretToken, userToken);
        res.send(profile);
        console.log('Sent Profile KYC');
    } catch(err) {
        console.error(err);
        const error = utils.getErrorObject(err);
        res.status(error.status).send(error);
    }
});

app.post('/abha/registration/aadhaar/generateOtp', (req, res) => services.generateAadhaarOTP(req, res));
app.post('/abha/registration/aadhaar/verifyOtp', (req, res) => services.verifyAadhaarOTP(req, res));
app.post('/abha/registration/aadhaar/checkAndGenerateAbhaOrMobileOTP', (req, res) => services.checkAndGenerateAbhaOrMobileOTP(req, res));
app.post('/abha/registration/aadhaar/verifyMobileOTP', (req, res) => services.verifyMobileOTP(req, res));

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
