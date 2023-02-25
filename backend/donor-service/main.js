const express = require('express');
const yaml = require('yamljs');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const https = require('https');
const qs = require('qs');
const FormData = require('form-data');
const redis = require('./services/redis.service');
const config = require('./configs/config');
const constants = require('./configs/constants');
const SERVICE_ACCOUNT_TOKEN = "SERVICE_ACCOUNT_TOKEN";
const R = require('ramda');
const {sendNotification} = require("./services/notify.service");
const {LOGIN_LINK, INVITE_TEMPLATE_ID, NOTIFY_TEMPLATE_ID} = require("./configs/config");
const app = express();

(async() => {
    await redis.initRedis({REDIS_URL: config.REDIS_URL})
})();

const swaggerDocs = yaml.load('./abha-swagger.yaml');
app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

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

const getClientSecretResponse = async() => {
    let data = {
        'clientId': config.CLIENT_ID,
        'clientSecret': config.CLIENT_SECRET
    }
    return await axios.post('https://dev.abdm.gov.in/gateway/v0.5/sessions', data);
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
    profile.personalDetails.gender = constants.GENDER_MAP[profileFromRedis.gender];
    profile.personalDetails.photo = profileFromRedis.profilePhoto;
    profile.addressDetails.state = toTitleCase(profileFromRedis.stateName);
    profile.addressDetails.district = profileFromRedis.districtName;
    profile.addressDetails.pincode = profileFromRedis.pincode;
    profile.identificationDetails.abha = String(profileFromRedis.healthIdNumber).replace(/-/g, '');
    return profile;
}


const getClientSecretToken = async() => {
    let clientSecret = await redis.getKey('clientSecret');
    if(clientSecret === null) {
        let clientSecretResponse = (await getClientSecretResponse()).data;
        redis.storeKeyWithExpiry('clientSecret', clientSecretResponse.accessToken, parseInt(clientSecretResponse.expiresIn));
        clientSecret = clientSecretResponse.accessToken;
    }
    return clientSecret;
}

app.post('/auth/sendOTP', async(req, res) => {
    console.log('sending OTP');
    const clientSecretToken = await getClientSecretToken();
    const abhaId = req.body.healthId;
    //TODO:get method from frontend
    const method = 'MOBILE_OTP';
    try {
        if(config.UNIQUE_ABHA_ENABLED) {
            const key = getKeyForBasedOnEntityName("Pledge");
            const isPresent = await redis.getKey(key+abhaId) !== null ? true : false;
            if(isPresent) {
                throw {
                    status: 409,
                    message: 'Entered ABHA number is already registered as pledger. Please login to view and download pledge certificate'
                };
            }
        }
        const otpSendResponse = (await axios.post(`${config.BASE_URL}/v1/auth/init`, {"authMethod": method, "healthid": abhaId},
            {headers: {Authorization: 'Bearer '+clientSecretToken}})).data;
        res.send(otpSendResponse);
        console.log('OTP sent');
    } catch(err) {
        let message = "";
        console.log(err?.response?.data?.code);
        if(err?.response?.data?.code === 'HIS-500') {
            message = "Please enter valid ABHA Number";
        }
        else if(err?.response?.data?.code === 'HIS-422'){
            message = "Please wait for 30 minutes to try again with same ABHA number";
        } else {
            message = err?.message || err?.response?.data || err;
        }
        let error = {
            message: message
        }
        res.status(err.status || 500).send(error);
    }
});


app.post('/auth/verifyOTP', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    const transactionId = req.body.transactionId;
    const otp = req.body.otp;
    const clientSecretToken = await getClientSecretToken();
    try {
        const verifyOtp = (await axios.post(`${config.BASE_URL}/v1/auth/confirmWithMobileOTP`, {
            "otp": otp,
            "txnId": transactionId
        }, {headers: {Authorization: 'Bearer ' + clientSecretToken}})).data;
        console.log('OTP verified', verifyOtp);
        const userToken = verifyOtp.token;
        const profile = (await axios.get(`${config.BASE_URL}/v1/account/profile`, {headers: {Authorization: 'Bearer ' + clientSecretToken, "X-Token": 'Bearer ' + userToken}})).data;
        redis.storeKeyWithExpiry(profile.healthIdNumber.replaceAll("-",""), JSON.stringify(profile), config.EXPIRE_PROFILE);
        res.send(profile);
        console.log('Sent Profile KYC');
    } catch(err) {
        let message = err?.message || err;
        let status = err?.response?.status || err?.status || 500
        if(err?.response?.data?.details[0]?.code === 'HIS-1039') {
            message = 'You have exceeded the maximum limit of failed attempts. Please try again in 12 hours';
            status = 429;
        } else if(err?.response?.data?.details[0]?.code === 'HIS-1013') {
            message = 'Please enter correct OTP number';
            status = 401;
        }
        let error = {
            status: status,
            message: message
        }
        // res.status(err.response.status).send(err.response.data);
        res.status(error.status).send(error);
    }
});


const getRegisteredCount = async(key) => {
    const value = await redis.getKey(key);
    return ((value === null ? 0 : parseInt(value)) + 1) + "";
}

function getKeyForBasedOnEntityName(entityName) {
    let category = null;
    switch(entityName) {
        case "Pledge":
            category = "D";
            break;

    }
    return category;
}

async function sendNotifications(profile) {
    if (R.pathOr("", ["personalDetails", "mobileNumber"], profile).length > 0) {
        await sendNotification(profile.personalDetails.mobileNumber, "Congratulations!\\n" +
            "You’ve successfully pledged for organs/tissues donation.\\n" +
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
        const year = new Date().getFullYear().toString().substring(2);
        const registrationCategory = getKeyForBasedOnEntityName(entityName);
        if(registrationCategory === null) {
            throw new Error({error: "Entity " + entityName + " not supported"})
        }
        const registered = await getRegisteredCount(registrationCategory);
        const nottoId = registrationCategory + year + (registered + "").padStart(parseInt(config.NUMBER_OF_DIGITS),'0');
        profile.identificationDetails.nottoId = nottoId;
        const inviteReponse = (await axios.post(`${config.REGISTRY_URL}/api/v1/${entityName}/invite`, profile)).data;
        redis.increment(registrationCategory);
        const abha = profileFromReq.identificationDetails.abha;
        redis.storeKey(getKeyForBasedOnEntityName(entityName)+abha, "true");
        const osid = inviteReponse.result[entityName].osid;
        const esignFileData = (await getESingDoc(abha)).data;
        const uploadESignFileRes = await uploadESignFile(osid, esignFileData);
        console.log(uploadESignFileRes);
        sendNotifications(profile);

        res.send(inviteReponse);
    } catch(err) {
        console.log(err);
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
    const userData = JSON.parse(await getUserData(getKeyForBasedOnEntityName(entityName) + entityId));
    try {
        if(checkIfNonEditableFieldsPresent(profileFromReq, userData)) {
            throw {error: 'You can only modify Pledge details or Emergency Contact Details'};
        }
        const updateApiResponse = (await axios.put(`${config.REGISTRY_URL}/api/v1/${entityName}/${entityId}`, profileFromReq, {headers: {...req.headers}})).data;
        const esignFileData = (await getESingDoc(profileFromReq.identificationDetails.abha)).data;
        const uploadESignFileRes = await uploadESignFile(entityId, esignFileData);
        console.log(uploadESignFileRes);
        res.send(updateApiResponse);
        redis.deleteKey(getKeyForBasedOnEntityName(entityName) + entityId);
    } catch(err) {
        err = {
            message: err?.response?.data || err?.message || err
        }
        console.log(err);
        res.status(500).json(err);
    }
});

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
            signUrl: config.ESIGN_FORM_SIGN_URL,
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

    const apiResponse = await axios({
        method: 'post',
        url: config.ESIGN_ESP_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    let xmlContent = apiResponse.data.espRequest;
    // xmlContent = xmlContent.replace(config.ESIGN_FORM_REPLACE_URL, `${config.PORTAL_PLEDGE_REGISTER_URL}?data=${btoa(JSON.stringify(req.body))}`);
    await redis.storeKeyWithExpiry(getEsginKey(pledge.identificationDetails.abha), apiResponse.data.aspTxnId, config.EXPIRE_PROFILE)
//         res.send(`
//         <form action="${config.ESIGN_FORM_SIGN_URL}" method="post" id="formid">
//             <input type="hidden" id="eSignRequest" name="eSignRequest" value='${xmlContent}'/>
//             <input type="hidden" id="aspTxnID" name="aspTxnID" value='${apiResponse.data.aspTxnId}'/>
//             <input type="hidden" id="Content-Type" name="Content-Type" value="application/xml"/>
//         </form>
//         <script>
//
//             document.getElementById("formid").submit();
//         </script>
        return {xmlContent: xmlContent, txnId: apiResponse.data.aspTxnId};
// `);
}

const getUserData = async(key, req) => {
    let userData = await redis.getKey(key);
    if(userData !== null) {
        return userData;
    }
    userData = (await axios.get(`${config.REGISTRY_URL}/api/v1/${req.params.entityName}/${req.params.entityId}`, {headers: {...req.headers}})).data;
    redis.storeKeyWithExpiry(key, JSON.stringify(userData), 2 * 24 * 60 * 60);
    return JSON.stringify(userData);
}

app.put('/esign/init/:entityName/:entityId', async(req, res) => {
    try {
        const userData = JSON.parse(await getUserData(getKeyForBasedOnEntityName(req.params.entityName) + req.params.entityId, req));
        if(checkIfNonEditableFieldsPresent(req.body.data, userData)) {
            throw {error: 'You can only modify Pledge details or Emergency Contact Details'};
        }
        const esignData = await getEsignData(req.body.data);
        res.send({
            signUrl: config.ESIGN_FORM_SIGN_URL,
            xmlContent: esignData.xmlContent,
            aspTxnId: esignData.txnId,
        })
    } catch(err) {
        console.log(err);
        res.status(500).json(err?.response?.data ||err?.message || err);
    }
});

function checkIfNonEditableFieldsPresent(reqData, userData) {
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
        headers: {},
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
                // console.error(error)
                res.status(404).send({message: "NOT GENERATED"})
            });
    } catch (e) {
        // console.error(e)
        res.status(404).send({message: "NOT GENERATED"})
    }
});

app.listen('3000');
