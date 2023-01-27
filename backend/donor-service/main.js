const express = require('express');
const yaml = require('yamljs');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const redis = require('./services/redis.service');
const config = require('./configs/config');
const constants = require('./configs/constants');

const app = express();
(async() => {
    await redis.initRedis({REDIS_URL: config.REDIS_URL})
})();

const swaggerDocs = yaml.load('./abha-swagger.yaml');
app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

app.use('/api-docs', swagger.serve, swagger.setup(swaggerDocs));

const getClientSecretResponse = async() => {
    let data = {
        'clientId': config.CLIENT_ID,
        'clientSecret': config.CLIENT_SECRET
    }
    return await axios.post('https://dev.abdm.gov.in/gateway/v0.5/sessions', data);
}

app.post('/auth/sendOTP', async(req, res) => {
    console.log('sending OTP');
    let secretKey = await redis.getKey('clientSecret');
    if(secretKey === null) {
        let clientSecretResponse = (await getClientSecretResponse()).data;
        redis.storeKeyWithExpiry('clientSecret', clientSecretResponse.accessToken, parseInt(clientSecretResponse.expiresIn));
        secretKey = clientSecretResponse.accessToken;
    }
    const abhaId = req.body.healthId;
    const method = 'AADHAAR_OTP';
    try {
        const otpSendResponse = (await axios.post(`${config.BASE_URL}/v1/auth/init`, {"authMethod": method, "healthid": abhaId}, {headers: {Authorization: 'Bearer '+secretKey}})).data;
        res.send(otpSendResponse);
        console.log('OTP sent');
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/auth/verifyOTP', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    const transactionId = req.body.transactionId;
    const otp = req.body.otp;
    let secretKey = await redis.getKey('clientSecret');
    if(secretKey === null) {
        let clientSecretResponse = (await getClientSecretResponse()).data;
        redis.storeKeyWithExpiry('clientSecret', clientSecretResponse.accessToken, parseInt(clientSecretResponse.expiresIn));
        secretKey = clientSecretResponse.accessToken;
    }
    try {
        const verifyOtp = (await axios.post(`${config.BASE_URL}/v1/auth/confirmWithAadhaarOtp`, {
            "otp": otp,
            "txnId": transactionId
        }, {headers: {Authorization: 'Bearer ' + secretKey}})).data;
        console.log('OTP verified', verifyOtp);
        const userToken = verifyOtp.token;
        const profile = (await axios.get(`${config.BASE_URL}/v1/account/profile`, {headers: {Authorization: 'Bearer ' + secretKey, "X-Token": 'Bearer ' + userToken}})).data;
        redis.storeKeyWithExpiry(profile.healthIdNumber, JSON.stringify(profile), config.EXPIRE_PROFILE)
        res.send(profile);
        console.log('Sent Profile KYC');
    } catch(err) {
        console.error(err);
        res.send(err.status);
    }
});

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
    profile.personalDetails.middleName = profileFromRedis.middleName;
    profile.personalDetails.dob = (`${profileFromRedis.yearOfBirth}-${String(profileFromRedis.monthOfBirth).padStart(2, '0')}-${String(profileFromRedis.dayOfBirth).padStart(2, '0')}`);
    profile.personalDetails.gender = constants.GENDER_MAP[profileFromRedis.gender];
    profile.addressDetails.state = toTitleCase(profileFromRedis.stateName);
    profile.addressDetails.district = profileFromRedis.districtName;
    profile.addressDetails.pincode = profileFromRedis.pincode;
    profile.identificationDetails.abha = String(profileFromRedis.healthIdNumber).replace(/-/g, '');
    return profile;
}

app.post('/register/:entityName', async(req, res) => {
    console.log('Inviting entity');
    const profileFromRedis = JSON.parse(await redis.getKey(req.body.abhaId));
    const profileFromReq = req.body.details;
    const profile = getProfileFromUserAndRedis(profileFromReq, profileFromRedis);
    const entityName = req.params.entityName;
    try {
        const response = (await axios.post(`${config.REGISTRY_URL}/api/v1/${entityName}/invite`, profile)).data;
        res.send(response);
    } catch(err) {
        console.log(err);
        res.send(err.status);
    }
    console.log('Entity Invited');
});

app.listen('3000');