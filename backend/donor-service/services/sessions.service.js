const axios = require('axios').default;
const redis = require('./redis.service');
const config = require('../configs/config')
const getClientSecretResponse = async() => {
    let data = {
        'clientId': config.CLIENT_ID,
        'clientSecret': config.CLIENT_SECRET
    }
    return await axios.post(config.ABHA_CLIENT_URL, data);
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

module.exports = {
    getClientSecretToken
}