const config = require("../configs/config");
const axios = require('axios').default;
const crypto = require('crypto');
const redis = require("./redis.service");

const PUBLIC_CERTIFICATE_KEY = 'auth_certificate';

async function getPublicCertificate() {
    let certificate = await redis.getKey(PUBLIC_CERTIFICATE_KEY);
    if(certificate === null) {
        console.debug("Certificate not found in cache")
        const certificateResponse = (await axios.get(`${config.BASE_URL}/v2/auth/cert`)).data;
        await redis.storeKeyWithExpiry(PUBLIC_CERTIFICATE_KEY, certificateResponse, 24*60*60);
        console.debug("Certificate cached")
        certificate = certificateResponse;
    } else {
        console.debug("Certificate retrieved from cache")
    }
    return certificate;

}

function encrypt(data, certificate) {
    const buffer = Buffer.from(data, "utf-8");
    const encrypted = crypto.publicEncrypt({key: certificate, padding: crypto.constants.RSA_PKCS1_PADDING}, buffer)
    return encrypted.toString("base64");
}


async function encryptWithCertificate(data) {
    const certificate = await getPublicCertificate();
    return encrypt(data, certificate)
}

function decrypt(data, certificate) {
    const buffer = Buffer.from(data, "base64");
    const decrypted = crypto.privateDecrypt({key: certificate, padding: crypto.constants.RSA_PKCS1_PADDING}, buffer)
    return decrypted.toString();
}

module.exports = {
    encryptWithCertificate,
    decrypt
}
