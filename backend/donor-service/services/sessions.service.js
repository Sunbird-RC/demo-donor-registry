const axios = require('axios').default;
const redis = require('./redis.service');
const config = require('../configs/config')

const getAccessTokenResponse = async() => {
    let data = {
        'clientId': config.CLIENT_ID,
        'clientSecret': config.CLIENT_SECRET
    }
    return await axios.post(config.ABHA_CLIENT_URL, data);
}

const getAbhaApisAccessToken = async() => {
    let clientSecret = await redis.getKey('clientSecret');
    if(clientSecret === null) {
        let accessTokenResponse = (await getAccessTokenResponse()).data;
        redis.storeKeyWithExpiry('clientSecret', accessTokenResponse.accessToken, parseInt(accessTokenResponse.expiresIn));
        clientSecret = accessTokenResponse.accessToken;
    }
    return clientSecret;
}

module.exports = {
    getAbhaApisAccessToken
}