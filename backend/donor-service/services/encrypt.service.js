const config = require("../configs/config");
const axios = require('axios').default;
const crypto = require('crypto');


async function getPublicCertificate() {
    const axiosResponse = await axios.get(`${config.BASE_URL}/v1/auth/cert`);
    return axiosResponse.data;
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
    encrypt,
    encryptWithCertificate,
    decrypt
}
