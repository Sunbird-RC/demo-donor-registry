const express = require('express');
const yaml = require('yamljs');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const https = require('https');

const redis = require('./services/redis.service');
const config = require('./configs/config');

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
    let secretKey = redis.getKey('clientSecret');
    if(secretKey === null) {
        let clientSecretResponse = await getClientSecretResponse();
        redis.storeKeyWithExpiry('clientSecret', clientSecretResponse.accessToken, parseInt(clientSecretResponse.expiresIn));
    }
    const abhaId = req.body.healthId;
    const method = 'AADHAR_OTP';
    const otpSendResponse = await axios.post(`${config.BASE_URL}/v1/auth/init`, {"authMethod": method, "healthid": abhaId}, {headers: {Authorization: 'Bearer '+secretKey}});
    res.send(otpSendResponse);
    console.log('OTP sent');
});

app.post('/auth/verifyOTP', (req, res) => {
    console.log('Verifying OTP and sending Profile KYC');
    res.send(
        {
            "healthIdNumber": "91-1111-1111-1111",
            "healthId": null,
            "mobile": "6178888888",
            "firstName": "dummy",
            "middleName": "dummy",
            "lastName": "dummy",
            "name": "dummy dummy dummy",
            "yearOfBirth": "2001",
            "dayOfBirth": "12",
            "monthOfBirth": "12",
            "gender": "M",
            "email": null,
            "profilePhoto": "",
            "stateCode": "Maharashtra",
            "districtCode": "Nagpur",
            "subDistrictCode": null,
            "villageCode": null,
            "townCode": null,
            "wardCode": null,
            "pincode": "4440001",
            "address": "Address line 1, Nagpur",
            "kycPhoto": null,
            "stateName": "MAHARASHTRA",
            "districtName": "Nagpur",
            "subdistrictName": null,
            "villageName": null,
            "townName": "Nagpur",
            "wardName": null,
            "authMethods": [
                "DEMOGRAPHICS",
                "MOBILE_OTP",
                "AADHAAR_BIO",
                "AADHAAR_OTP"
            ],
            "tags": {},
            "kycVerified": true,
            "verificationStatus": null,
            "verificationType": null,
            "clientId": "healthid-api",
            "phrAddress": null,
            "new": false,
            "emailVerified": false
        }
    );
    console.log('Sent Profile KYC');
});

app.post('/register', (req, res) => {
    console.log('Inviting entity');
    res.send({
        "id": "sunbird-rc.registry.invite",
        "ver": "1.0",
        "ets": 1674813458669,
        "params": {
            "resmsgid": "",
            "msgid": "2b9cdf2a-fe4e-481e-a51e-050ab6558b75",
            "err": "",
            "status": "SUCCESSFUL",
            "errmsg": ""
        },
        "responseCode": "OK",
        "result": {
            "Pledge": {
                "osid": "1-567e6a24-3162-48eb-a252-1ae877f8e64e"
            }
        }
    });
    console.log('Entity Invited');
});

app.post('/esign/init', async (req, res) => {
    const data = JSON.stringify({
        "document": {
            "integratorName": "HFRBank",
            "templateId": "TEMPLATE_1",
            "submitterName": "xxx",
            "signerName": "xx  xx",
            "hpId": "123-2441-xx-3409",
            "mobileNumber": "",
            "emailId": "",
            "signingPlace": "NA",
            "facilitybank": [{
                "facilityid": "xxx",
                "facilityName": "xx Joshi",
                "accountHolderName": "xx",
                "bankName": "xx Of xx",
                "accountNumber": "xx",
                "branchName": "xx",
                "ifscCode": "xx",
                "facilityManager": "xx Sharma",
                "pancardnumber": "xx",
                "address": "Agra",
                "state": "Uttar Pradesh",
                "district": "Karoli",
                "subdistrict": "Agra",
                "uploadmandateform": "Yes",
                "uploadcancalledcheque": "Yes",
                "uploadpancard": "Yes",
                "uploadAnnexureForm": "No"
            }]
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
    res.send(`
        <form action="${config.ESIGN_FORM_SIGN_URL}" method="post" id="formid">
            <input type="hidden" id="eSignRequest" name="eSignRequest" value='${apiResponse.data.espRequest}'/>
            <input type="hidden" id="aspTxnID" name="aspTxnID" value='${apiResponse.data.aspTxnId}'/>
            <input type="hidden" id="Content-Type" name="Content-Type" value="application/xml"/>
        </form>
        <script>
        
            document.getElementById("formid").submit();
        </script>
`);

})

app.listen('3000');
