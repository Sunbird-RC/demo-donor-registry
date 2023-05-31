const R = require('ramda');
const axios = require('axios').default;
const config = require('../configs/config')
const redis = require('../services/redis.service')

async function getAndCacheEKYCProfile(clientSecretToken, userToken) {
    const profile = (await axios.get(`${config.BASE_URL}/v1/account/profile`,
        {headers: {Authorization: 'Bearer ' + clientSecretToken, "X-Token": 'Bearer ' + userToken}})).data;
    if (R.pathOr("", ["healthIdNumber"], profile) !== "") {
        await redis.storeKeyWithExpiry(profile.healthIdNumber.replaceAll("-", ""), JSON.stringify(profile),
            config.EXPIRE_PROFILE);
    }
    return profile;
}

async function isABHARegistered(abhaId, force=false) {
    abhaId = abhaId.replaceAll("-", "");
    if (config.UNIQUE_ABHA_ENABLED || force) {
        const key = getKeyBasedOnEntityName("Pledge");
        return await redis.getKey(key + abhaId) !== null;
    }
    return false;
}

function getKeyBasedOnEntityName(entityName) {
    let category = null;
    switch(entityName) {
        case "Pledge":
            category = "D";
            break;

    }
    return category;
}

module.exports = {
    getAndCacheEKYCProfile,
    isABHARegistered,
    getKeyBasedOnEntityName
}
