const express = require('express');
const yaml = require('yamljs');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const https = require('https');

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
    const method = 'AADHAAR_OTP';
    try {
        const otpSendResponse = (await axios.post(`${config.BASE_URL}/v1/auth/init`, {"authMethod": method, "healthid": abhaId}, 
            {headers: {Authorization: 'Bearer '+clientSecretToken}})).data;
        res.send(otpSendResponse);
        console.log('OTP sent');
    } catch(err) {
        console.log(err)
        res.status(err.response.status).send(err.response.data);
    }
});


app.post('/auth/verifyOTP', async(req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    const transactionId = req.body.transactionId;
    const otp = req.body.otp;
    const clientSecretToken = await getClientSecretToken();
    try {
        const verifyOtp = (await axios.post(`${config.BASE_URL}/v1/auth/confirmWithAadhaarOtp`, {
            "otp": otp,
            "txnId": transactionId
        }, {headers: {Authorization: 'Bearer ' + clientSecretToken}})).data;
        console.log('OTP verified', verifyOtp);
        const userToken = verifyOtp.token;
        const profile = (await axios.get(`${config.BASE_URL}/v1/account/profile`, {headers: {Authorization: 'Bearer ' + clientSecretToken, "X-Token": 'Bearer ' + userToken}})).data;
        redis.storeKeyWithExpiry(profile.healthIdNumber, JSON.stringify(profile), config.EXPIRE_PROFILE);
        res.send(profile);
        console.log('Sent Profile KYC');
    } catch(err) {
        console.log('Error : ', err);
        res.status(err.response.status).send(err.response.data);
    }
});

app.post('/register/:entityName', async(req, res) => {
    console.log('Inviting entity');
    const profileFromRedis = JSON.parse(await redis.getKey(req.body.abhaId));
    if(profileFromRedis === null) {
        res.status(401).send({message: 'Abha number verification expired. Please refresh the page and restart registration'});
        return;
    }
    const profileFromReq = req.body.details;
    const profile = getProfileFromUserAndRedis(profileFromReq, profileFromRedis);
    const entityName = req.params.entityName;
    try {
        const response = (await axios.post(`${config.REGISTRY_URL}/api/v1/${entityName}/invite`, profile)).data;
        res.send(response);
        console.log('Entity Invited');
    } catch(err) {
        res.status(err.response.status).send(err.response.data);
    }
});

app.get('/esign/init', async (req, res) => {
    try {
        if (!'data' in req.query) {
            res.status(400).send(new Error('Pledge data not available'));
        }
        const pledge = JSON.parse(req.query.data)
        const data = JSON.stringify({
            "document": {
                "integratorName": "NOTTO_DONOR_REGISTRY",
                "templateId": "TEMPLATE_1",
                "submitterName": "TarunL",
                "signingPlace": "Delhi",
                identification: {
                    ...pledge.identificationDetails
                },
                personaldetails: {
                    "middleName": "",
                    ...pledge.personalDetails
                },
                addressdetails: {
                    ...pledge.addressDetails
                },
                pledgedetails: {
                    ...pledge.pledgeDetails,
                    other: 'other' in pledge.pledgeDetails ? [pledge.pledgeDetails?.other]: []
                },
                emergencydetails: {
                    ...pledge.emergencyDetails
                },
                notificationdetails: {
                    ...pledge.notificationDetails
                }
            }
        });

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
        redis.storeKeyWithExpiry(`${pledge.identificationDetails.abha}-esign`, apiResponse.data.aspTxnId, config.EXPIRE_PROFILE)
        res.send(`
        <form action="${config.ESIGN_FORM_SIGN_URL}" method="post" id="formid">
            <input type="hidden" id="eSignRequest" name="eSignRequest" value='${xmlContent}'/>
            <input type="hidden" id="aspTxnID" name="aspTxnID" value='${apiResponse.data.aspTxnId}'/>
            <input type="hidden" id="Content-Type" name="Content-Type" value="application/xml"/>
        </form>
        <script>
        
            document.getElementById("formid").submit();
        </script>
`);
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }

})

app.get('/esign/:abha/status', async (req, res) => {
    console.log("Get status api called")
    try {
        let eSingTransactionId = await redis.getKey(`${req.params.abha}-esign`);
        console.log("Get status api called" + eSingTransactionId)
        await axios({
            method: 'get',
            url: config.ESIGN_ESP_PDF_URL.replace(':transactionId', eSingTransactionId),
            headers: {},
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        })
            .then(function (response) {
                res.send({status: "SUCCESS"})
            })
            .catch(function (error) {
                // console.error(error)
                res.status(404).send({status: "NOT GENERATED"})
            });
    } catch (e) {
        // console.error(e)
        res.status(404).send({status: "NOT GENERATED"})
    }
});

app.listen('3000');
