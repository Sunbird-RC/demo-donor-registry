const express = require('express');
const yaml = require('yamljs');
const swagger = require('swagger-ui-express');
const bodyParser = require('body-parser');
const redis = require('./services/redis.service');
const config = require('./config/config');

const app = express();
(async() => {
    await redis.initRedis({REDIS_URL: config.REDIS_URL})
})();

const swaggerDocs = yaml.load('./abha-swagger.yaml');
app.use('/docs', swagger.serve, swagger.setup(swaggerDocs));
app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

app.post('/auth/verifyOTP', (req, res) => {
    res.send(
        {
            "healthIdNumber": "91-3075-5157-3552",
            "healthId": null,
            "mobile": "8983837675",
            "firstName": "Tejas",
            "middleName": "Hemant",
            "lastName": "Varade",
            "name": "Tejas Hemant Varade",
            "yearOfBirth": "1998",
            "dayOfBirth": "29",
            "monthOfBirth": "1",
            "gender": "M",
            "email": null,
            "profilePhoto": "",
            "stateCode": "27",
            "districtCode": "469",
            "subDistrictCode": null,
            "villageCode": null,
            "townCode": null,
            "wardCode": null,
            "pincode": "431005",
            "address": "C/O Hemant Varade Flat No. 7, Udyog Ratna Apartment Khivansara Park Garkheda Aurangabad",
            "kycPhoto": null,
            "stateName": "MAHARASHTRA",
            "districtName": "Aurangabad",
            "subdistrictName": null,
            "villageName": null,
            "townName": "Aurangabad",
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
});

app.post('/auth/sendOTP', (req, res) => {
    console.log(req.body);
    res.send(200);
});
app.listen('3000');