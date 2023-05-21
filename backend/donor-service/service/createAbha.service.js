const { default: axios } = require('axios');
const config = require('../configs/config');
const { AADHAAR_EXPIRY } = require('../configs/constants');
const { encryptWithCertificate } = require('../services/encrypt.service');
const {getClientSecretToken} = require('../services/sessions.service')
const redis = require('../services/redis.service');
const utils = require('../utils/utils')
const R = require('ramda');

async function generateAadhaarOTP(req, res) {
    const generateOtpUrl = config.BASE_URL + '/v2/registration/aadhaar/generateOtp';
    const clientSecretToken = await getClientSecretToken();
    const encryptedAadhaar = await encryptWithCertificate(req.body.aadhaar);
    try {
        const generateOtpResponse = (await axios.post(generateOtpUrl, {
            aadhaar: encryptedAadhaar
        }, {
            headers: {
                Authorization: 'Bearer '+clientSecretToken
            }
        })).data
        console.debug('generateOtpResponse : ', generateOtpResponse)
        res.json(generateOtpResponse);
    } catch(err) {
        const error = utils.getErrorObject(err);
        res.status(error.status).send(error);
    }
}

async function verifyAadhaarOTP(req, res) {
    const verifyOtpUrl = config.BASE_URL + '/v2/registration/aadhaar/verifyOTP';
    const txnId = req.body.txnId;
    const clientSecretToken = await getClientSecretToken();
    const encryptedOtp = await encryptWithCertificate(req.body.otp)
    try {
        const verifyAadhaarOTPResponse = (await axios.post(verifyOtpUrl, {
            txnId: txnId,
            otp: encryptedOtp
        }, {
            headers: {
                Authorization: 'Bearer ' + clientSecretToken 
            }
        })).data;
        console.debug('verifyAadhaarOTPResponse : ', verifyAadhaarOTPResponse);
        if(verifyAadhaarOTPResponse.new) {
            var age = parseInt(utils.calculateAge(verifyAadhaarOTPResponse.birthdate))
            if(age < 18) {
                throw {status: 403, message: 'Please check back and registry with us when you are 18.'}
            }
            redis.storeKeyWithExpiry(txnId, JSON.stringify(getCacheableAadhaarDetails(verifyAadhaarOTPResponse)), AADHAAR_EXPIRY);
            res.json({new: verifyAadhaarOTPResponse.new, txnId: verifyAadhaarOTPResponse.txnId})
            return;
        }
        const createAbhaNumberResponse = await getAndCacheEKYCProfile(clientSecretToken, verifyAadhaarOTPResponse.jwtResponse.token);
        res.json(createAbhaNumberResponse);
        return;
    } catch(err) {
        const error = utils.getErrorObject(err)
        res.status(error.status).send(error)
    }
}

async function checkAndGenerateAbhaOrMobileOTP(req, res) {
    const checkAndGenerateMobileOTPUrl = config.BASE_URL + '/v2/registration/aadhaar/checkAndGenerateMobileOTP';
    const txnId = req.body.txnId;
    const mobile = req.body.mobile;
    const clientSecretToken = await getClientSecretToken();
    try {
        const checkAndGenerateMobileOTPResponse = (await axios.post(checkAndGenerateMobileOTPUrl, {
            mobile: mobile,
            txnId: txnId
        }, {
            headers: {
                Authorization: 'Bearer ' + clientSecretToken
            }
        })).data;
        console.debug('checkAndGenerateMobileOTPResponse : ', checkAndGenerateMobileOTPResponse);
        if(checkAndGenerateMobileOTPResponse.mobileLinked) {
            const userAadhaarData = JSON.parse(await redis.getKey(txnId));
            const profile = {
                ...userAadhaarData,
                mobile: mobile
            }
            await redis.storeKeyWithExpiry(txnId, JSON.stringify(profile), AADHAAR_EXPIRY)
            const abhaResponse = await createABHANumber(txnId);
            res.json(abhaResponse);
            return
        }
        res.json(checkAndGenerateMobileOTPResponse);
    } catch(err) {
        const error = utils.getErrorObject(err)
        res.status(error.status).send(error)
    }
}

async function verifyMobileOTP(req, res) {
    const verifyMobileOTPUrl = config.BASE_URL + '/v2/registration/aadhaar/verifyMobileOTP';
    const txnId = req.body.txnId;
    const encryptedOtp = await encryptWithCertificate(req.body.otp)
    const clientSecretToken = await getClientSecretToken();
    try {
        const verifyMobileOTPResponse = (await axios.post(verifyMobileOTPUrl, {
            txnId,
            otp: encryptedOtp
        }, {
            headers: {
                Authorization: 'Bearer ' + clientSecretToken
            }
        }));
        console.debug(verifyMobileOTPResponse);
        if(verifyMobileOTPResponse.status === 200) {
            const abhaResponse = await createABHANumber(txnId);
            res.json(abhaResponse);
            return
        }
        res.json(verifyMobileOTPResponse.data)
    } catch(err) {
        const error = utils.getErrorObject(err);
        res.status(error.status).send(error)
    }
}

async function createABHANumber(txnId) {
    const createABHAUrl = config.BASE_URL + '/v1/registration/aadhaar/createHealthIdWithPreVerified';
    const promise = await redis.getKey(txnId);
    const userAadhaarData = JSON.parse(promise);
    const clientSecretToken = await getClientSecretToken();
    const createAbhaResponse = (await axios.post(createABHAUrl, {
        ...userAadhaarData,
        txnId: txnId
    }, {
        headers: {
            Authorization: 'Bearer ' + clientSecretToken
        }
    })).data;
    await redis.deleteKey(txnId);
    console.debug('createAbhaResponse : ', createAbhaResponse);
    const profile = await getAndCacheEKYCProfile(clientSecretToken, createAbhaResponse.token)
    return profile;
}

async function getAndCacheEKYCProfile(clientSecretToken, userToken) {
    const profile = (await axios.get(`${config.BASE_URL}/v1/account/profile`,
        {headers: {Authorization: 'Bearer ' + clientSecretToken, "X-Token": 'Bearer ' + userToken}})).data;
    if (R.pathOr("", ["healthIdNumber"], profile) !== "") {
        await redis.storeKeyWithExpiry(profile.healthIdNumber.replaceAll("-", ""), JSON.stringify(profile),
            config.EXPIRE_PROFILE);
    }
    return profile;
}

function getCacheableAadhaarDetails(aadhaarDetails) {
    const name = aadhaarDetails.name.split(' ')
    const firstName = name[0];
    const lastName = name[name.length - 1];
    const middleName = name.slice(1, name.length - 1).join(' ')
    console.debug(firstName, "\n", middleName, "\n", lastName)
    const profileDetails = {
        firstName,
        middleName,
        lastName,
        email: aadhaarDetails.email,
        profile: aadhaarDetails.profilePhoto
    }
    return profileDetails;
}

module.exports = {
    generateAadhaarOTP,
    verifyAadhaarOTP,
    checkAndGenerateAbhaOrMobileOTP,
    verifyMobileOTP
}