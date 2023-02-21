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
    profile.personalDetails.middleName = profileFromRedis.middleName;
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
                throw JSON.stringify({error: 'Pledger with this ABHA Id already exists. Please login to continue'});
            }
        }
        const otpSendResponse = (await axios.post(`${config.BASE_URL}/v1/auth/init`, {"authMethod": method, "healthid": abhaId},
            {headers: {Authorization: 'Bearer '+clientSecretToken}})).data;
        res.send(otpSendResponse);
        console.log('OTP sent');
    } catch(err) {
        console.log(err);
        res.status(500).send(err?.response?.data || err?.message || err);
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
        console.error(err)
        // res.status(err.response.status).send(err.response.data);
        console.log('Error : ', err);
        res.status(500).send(err?.response?.data || err);
        const mockedProfile = {
            "healthIdNumber": "91-5457-8518-6762",
            "healthId": null,
            "mobile": "1234567890",
            "firstName": "John",
            "middleName": "Simon",
            "lastName": "Doe",
            "name": "John Simon Doe",
            "yearOfBirth": "1998",
            "dayOfBirth": "15",
            "monthOfBirth": "4",
            "gender": "F",
            "email": "john@gmail.com",
            "profilePhoto": "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCADIAKADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDexS0YpakBMUUtGKAEpaKXFABS4oxSgYpAJikxT8UYoAZikp5FJigBMUYp2OelA70ANpcU6lxQAzFJipMUmKAG4pMU/FGKAI6UClxSgUwEA5oxxT8UYoAaBRinYox2oATFLXMa14403SnMMA+2zjqI3ARexBbnn2APviuE1Pxvq+onYbnyIv8Annb/ACA/U5yfpnHtRYD1e71XT7Fil1e28LgZ2PIA34L1NZE3jnw/FnF4z4ODthcY/MCvHWm+UAHAHYVEZG9aAPW2+Imhg4C3bDPURqB+rVci8a6DM6oL7YzHHzxOAD7nGB9c4rxdRup4DIc5PtRoFj6BimSaMSRSJIh6Mh3A/jUikZP1rwuy1zUtPK/Zr64jVc4QSEoCc/wHKnqeorv/AA/46ttQdLa/C21zwA275JSeDg/wnPY/nRYDtwKXFIhyo6U6kAlGKWigBMUmKdRQAyjNM3U0tTAlz70bhUBemmQ0XAnkmjhieWR1SNAWZmOAAO9eX+KPGsuqF7TT3eGx5Vn6PMP6KfTqe/cVJ448RNdTHS7aQ+REf35B++/936D+f0riGY4poBXdfr9ahZs9qGb6flTQGbtQwDrQc1PFbluCCD71aWxYjGOKlyKSK9uOCcUyXcea0VsnC8fypv2VicEcVPMh2MsBsU9TuzkfhV2awZBlM89qpNuU8jBHtVJpk2aOw8H+L7jS7qKxvZWewYhQXOfJ7ZB/u9OO3Ue/rikMuRXziJfmwwr2HwXrv9o6YsUkm+aEKj8c9wuT74P1wfxYjrsUYpUIZc5yPWnYpAMxQRT8UmKYFEtTS1ITTaQwJrG8RaqdM0qeVGxKF+U+mSBn8yB+NbFcH45uSLKKMt8082Qp/uIDn/x5gc+wpAcMzE5ZiSfUnJNQNmRsD8qkfnjqTVyzthkEiqbsNRuRQWBYAtxWhDYKvUA1djjGKnjj5rnlNnRGmiFLRAPu1ajtlx0xViOInqKnSLArO7K5Uil9nXHQVHJbAjoK1FiFDQ8UrhZGFJGRle1Z19b7lyoAOK6GeA5zWbcQ8E1UZWYpRujmzEMEjqK2fDWrHRtXhmbLWsjBJlzjCk8n6jqP8ms6dCJGOPlNRQnbIVzkHqK6k7o5mrM+g7WQNGrK4dW/iHQ9watVzXgu5a78MWTvnKKYuuT8h2gn67f1rpgQeKZIYpDTqSgDKNJQaKkoinYrC20jcflXPqeBXmPjdiNdVSQY0hVI8HooJGD75B/SvTn2syox4znH06V5B4qkM3ia9I+4sm0cenB/XNNCKFtE0snArZht9gHUmqulxc7iK1dtZzZvCIIMVajAxVZUOasxKRz2rGRsi5GvAFWFUYqCPoKsoM4qUSyRI+OlDRjvU6j5RTXB7VViChcIO1ZFzH1ranBANZs0ZYmpNFsYEsGQ3FZWPLuPx6V00sPqKwL2ExzA44renLUxqRPVfAnOgK8Z3BS4YZ5BzkfnXZryOK4L4aMTo1yn3v8ASj+ChEx+ufzrvEySen4VsYDsUmKfikI4oAxjTS23k0hlGcDk00KznLHipKG84Zzg57e1eT+IrUxTrOSS0oyx9T/nmvWZI1cEMAR0zivL/FN0bq8dFCLHAxjCqMdD3podr7CabGFs0buRmnyX0Ubbc7iOuKSCPfpcSbsZUVRltI14zx7ms3bqbJtLQvrq1qrfMW/KrcWo2rHiQc9M1z32OHqshz+dMkhkjYc49M8Zo5Ii55HaRTxuoIYc1bideOa4+3u3VdpOCK1rS8Lxc81m42Kvc6Lz1QckY96rTahFERn36Vl3k0nlDr9RWXNM5UDuPWmtRM1ZdZiHVSSapy61B/ccVlhS7ANIKnW0hc4aQMfTOKrlj1J5pdC5DdxXTAA4b0Peq+t2gjslm96YdPVXUx8c9jWlri50OMZyd4H1pRSvoNttanU/DWwePRZrncAJpeBjqAP/AK5/M13Krj61zfgq7hl0KGFIzE0AEbAgYYhRlsjuep98/WumFdBgxO1BFOpCKBGGRxTTkU40hzipKI5XCxHLAV5NrMXlarfq4I/fNj6ZOP0xXqU8nAIwW7c9/r/nvXBeMLIw3yucs8yBnYjAzkjAHYYApMuD6EcUZFhEB/cH8qyZ7eeSXBIUep/wrdtwDbR+m0Uktvv4xWTlZm3LdGNqmnJFpcc0AaVgf3j7jkfh2FO8PWD6vc+XGsqRRQHzXZgVL5OMDHHBUYyehOecC59kuI2/duw+hq3Gbzy/LMjbO4LHH5VoqiMnTd9DGurKS2meIj5lPKj09R7VoaUvmLgipbiMMOgL93xz6dataXCEfOO9YzaNYxF1JPKTp26VirZz3MyoBy3b0+tdHqKea5xVRIZGh2RuUbn+IjcCQf6D8hSg1cJLQ5y/Emm6pJbTTyxRohw0agljt+XAyOM478DJ5xg2baxuJ9GF+ZizbyNsn8Q9Qa1Jra4mINxCsxUYUyDdj86R7W6uAEdiEHAUcAD6Vs5xtsZKDvuZ1pLK4AKsPrWnfKz6ZEvcSjH5GrEdmkMYAHNR3+I7AE9Fbd+QNYqV2ataHaeBLZ49FaRiMTXDyDpzhVX+akfhXWVR0mz+wafDafLmFAjFRjLdWP4nJq+K6oqyOaTu7iUhp2KQiqJMImmHLcfpTzTeO9QUQmIecjcZAOPaua8a2xms4pVHCMUP1IyK6lhkcGq95Yx3tjJbv0cfe9D1z+dJoadmcLp/zWcWTkgYrSjiBGMVnxW8lizwS43I7DI6EAkcfiD+VaUMgx1rnqI6ou6A2y9qa1soHPSrSkdagvJ1iiJ/ICs0iijOFBx2qzZqMcVTFvLK6vJwD29K07e2PAVab2AjmK7+TRCgbg9DT7mzO0t3qva+ZDIFkB2noakC+tsR3yKf9mAGTViIqQOaVwNtU7kmZOBn5RVRrf7bd2dnjcZp0TaO67huP4Lk/hV64AFW/DNpFLr8VxMXUwq3kZRgHYqQxBxg4UkYz/F7VVJXkTUdkd6i4+ven0gpwrtOQKQ0tNNAGEaaTinE1ExqSgLCo5JikbMiM7BSQoIBb254pJD8hA6niqkk0aqxcj5Rkv6D19qQzndTEkoS8YkiX7wKFdjDqvPPAwOfSqkMpGK2L1HvLYmNCsa8jfwWxnoMZP5gc96wYmw+DWU0b03oXzc4wKr3I+0JjdyORUFwxiYtjIIqvFfLkg4BrNRuaXRO0t4uBuRgOgPFXbPVynDfK3cGqP2lH71IqxSLk4JFV6gaj3ss3zoFKj+82KYJ5LjBaMIAfXrVZJI0XGal+0IVxmoaAvxyYAOam84MKxo7sBypbirCzZQkGp1QDruXLYFalvb6xay6NJaQvKseJNpjXa6y/wCtVnP3Soxjpnjrg1k2Vq2p6lDaLnDt8xHZR1P5Zr05AAoAGAB09K6KMdLnPVlrYeDTs02lrcwFoNFIaAMFulQmpm6VA1SyyKRgFLMQFXkk9BWeQLhvMl/1YOY1P57j756en1qzeLviEeSAzKCR6A5I+hxj8aYxAB9CfzpDRE+4AtkbV5BbmuU1Iww3zLE67iN2wdqv6/rlvp6BVYGY9FHb3/w9f1rgYr6S41ZJZGyWb+fFJq5alZnVGYSoFPUUwW0bZ3KCD1qqsm18E1ei571i1Y2Won9njH7sKw9OlSLaqkeDA+7/AGWqQJIOUpyTXa/wZ/ChSLTsJ9iLp8luV92cmmNp+xcs5z6AmrSyXbcEECiSN+hPPrSc2Ju5liFkk4YsO9XvOAQIuSfamSlY12rirXh7D+IrFSOPM3Hj0Bb+lNe9uQ9Dr/Cml/Y4HuJh/pEvBB/gX0+pxz+HpXTCqVmhjiVT2A7deKuA11JW0ORu7uPFLTRTqYhaQ0UhoAwz3qB+M1K7YqtI1Sy0V7kFozjqOQO9c9r+tpp1phG/fOMrnoo9fc+38q27yfyLd3JUYHG44H4n09T2GTXkur6k2oXkkxZipOE3dcZPX8ycdBnilYd7Fa7u5LiV3ZizOcsx61WiyJkPowpeAuT36U3Hzr7mmJbnUTL3qS3uSnDdKkRQ6Cj7KByK52zrNO2vI2Ucirf2mIc7hXPfZRuyHYfSrCWakfPJIfxqGkO5ti8ixwwqtPdqRhTk+1VBbIv3VJ+pqaKHJ5GBSdkK5HsZzuarmiMsPiGyLnAMuz8WBUfqacUwuAMCqof7Ldw3OzeYZUlC5xkqwYD9KcXqJrQ9XiHy5I5zUoPNQwyJLGskbh43AdWHQg8g1LXYcRIKXNMBp2aAHU1jRTWNAHPO3Wq7HOac7VCxHrUs0RzXjW8NtpKoCQZW2fTIOfzG4fjXmgO5+eldv4+ck2cYJ2ncT+lcN2/GmiXuSYztNLGm+6jX/aFKuMLVyyg/fBz60m7IaV2b0RwBVjtUAX5cipEORXMzrRIACatxRgjrVdE5zV2PIHSpbGO8oDuafGmOlFOBAqWKwPjpVSdMg1aPJprJuFAzc8L+II7eBdOvnCIv+plY8AH+E+mOx6Y44wM9nXkxi5rV0nX73SgsPE9qvSJzyo/2T2+nI+ldEKvRmE6XVHoopwrO03V7TVIybeT5wMtE3DL9R/UcVfBrZO+xg1bcdmmmjNIaYjmXas/UdRh061a4nYBRwB3J7ADuaKKg0R5lrWtzavdBpcLEuRGgx8v1PrwKyHXg0UVS2JY+H5iorato9oX2ooqKhpBamumCopuNkmKKK5zoLUR6Zq2kgHeiipGO3igMTwKKKQEi8U/bmiigBGiB5pjQgUUUAT6bZS3GowJEzo27cZEOCijqQe3p+Ndz9pe3wHy6k/iKKK6qK925lNJstxzRzLuRgR/KlY8UUVqczVmf/9k=",
            "stateCode": "27",
            "districtCode": "490",
            "subDistrictCode": null,
            "villageCode": null,
            "townCode": null,
            "wardCode": null,
            "pincode": "411030",
            "address": "SHANIWAR PETH PUNE",
            "kycPhoto": null,
            "stateName": "MAHARASHTRA",
            "districtName": "Pune",
            "subdistrictName": null,
            "villageName": null,
            "townName": "PUNE",
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
            "emailVerified": true
        }
        // res.send(mockedProfile);
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

app.post('/register/:entityName', async(req, res) => {
    console.log('Inviting entity');
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
        res.send(inviteReponse);
    } catch(err) {
        console.log(err);
        res.status(500).json(err?.response?.data || err?.message || err);
    }
});

app.put('/register/:entityName/:entityId', async(req, res) => {
    console.log('Inviting entity');
    let profileFromReq = req.body;
    profileFromReq = JSON.parse(JSON.stringify(profileFromReq).replace(/\:null/gi, "\:\"\""));
    const entityName = req.params.entityName;
    const entityId = req.params.entityId;
    const userData = getUserData(getKeyForBasedOnEntityName(entityName) + entityId);
    try {
        if(checkIfNonEditableFieldsPresent(profileFromReq, userData)) {
            throw {error: 'You can only modify Pledge details or Emergency Contact Details'};
        }
        const updateApiResponse = (await axios.put(`${config.REGISTRY_URL}/api/v1/${entityName}/${entityId}`, profile, {headers: {...req.headers}})).data;
        const osid = updateApiResponse.result[entityName].osid;
        const esignFileData = (await getESingDoc(abha)).data;
        const uploadESignFileRes = await uploadESignFile(osid, esignFileData);
        console.log(uploadESignFileRes);
        res.send(updateApiResponse);
    } catch(err) {
        console.log(err);
        res.status(500).json(err?.response?.data || err?.message || err);
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
    console.log(userData);
    if(userData !== null) {
        return userData;
    }
    userData = (await axios.get(`${config.REGISTRY_URL}/api/v1/${req.params.entityName}/${req.params.entityId}`, {headers: {...req.headers}})).data;
    redis.storeKeyWithExpiry(key, JSON.stringify(userData), 2 * 24 * 60 * 60);
    return userData;
}

app.put('/esign/init/:entityName/:entityId', async(req, res) => {
    try {
        const userData = await getUserData(getKeyForBasedOnEntityName(req.params.entityName) + req.params.entityId, req);
        console.log("USERDATA : ", userData);
        if(checkIfNonEditableFieldsPresent(req.body.data, userData)) {
            throw {error: 'You can only modify Pledge details or Emergency Contact Details'};
        }
        const esignData = await getEsignData(userData);
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
    const partiallyEditablePersonalDetails = Object.keys(userData.personalDetails).filter(key => !(['motherName', 'bloodGroup', 'emailId'].includes(key)));
    const partiallyEditableAddressDetails = Object.keys(userData.addressDetails).filter(key => !(['addressLine2'].includes(key)));
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
