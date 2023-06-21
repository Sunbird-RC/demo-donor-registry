const profileService = require('./abhaProfile.service');

async function generateAadhaarOTP(req, res) {
    res.status(200).json({});
    return;
}

async function verifyAadhaarOTP(req, res) {
    res.send(profileService.getMockProfile());
    return;
}

module.exports = {
    generateAadhaarOTP,
    verifyAadhaarOTP
}
