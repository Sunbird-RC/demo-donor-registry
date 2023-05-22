const { default: axios } = require('axios');
const config = require('../configs/config');
const { encryptWithCertificate } = require('./encrypt.service');
const {getAbhaApisAccessToken} = require('./sessions.service')
const profileService = require('./abhaProfile.service');
const utils = require('../utils/utils')

async function generateAadhaarOTP(req, res) {
    const generateOtpUrl = config.BASE_URL + '/v2/registration/aadhaar/generateOtp';
    const clientSecretToken = await getAbhaApisAccessToken();
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
    const clientSecretToken = await getAbhaApisAccessToken();
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
            res.json({new: verifyAadhaarOTPResponse.new, txnId: verifyAadhaarOTPResponse.txnId})
            return;
        }
        const createAbhaNumberResponse = await profileService.getAndCacheEKYCProfile(clientSecretToken, verifyAadhaarOTPResponse.jwtResponse.token);
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
    const clientSecretToken = await getAbhaApisAccessToken();
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
    const clientSecretToken = await getAbhaApisAccessToken();
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
    const createABHAUrl = config.BASE_URL + '/v2/registration/aadhaar/createHealthIdByAdhaar';
    const clientSecretToken = await getAbhaApisAccessToken();
    const createAbhaResponse = (await axios.post(createABHAUrl, {
        txnId: txnId
    }, {
        headers: {
            Authorization: 'Bearer ' + clientSecretToken
        }
    })).data;
    console.debug('createAbhaResponse : ', createAbhaResponse);
    const profile = await profileService.getAndCacheEKYCProfile(clientSecretToken, createAbhaResponse.token)
    return profile;
}

module.exports = {
    generateAadhaarOTP,
    verifyAadhaarOTP,
    checkAndGenerateAbhaOrMobileOTP,
    verifyMobileOTP
}