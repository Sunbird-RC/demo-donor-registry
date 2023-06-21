const REDIS_URL = process.env.REDIS_URL;
const REGISTRY_URL = process.env.REGISTRY_URL;
const EXPIRE_PROFILE = process.env.EXPIRE_PROFILE;
const ESIGN_ESP_URL = process.env.ESIGN_ESP_URL;
const ESIGN_FORM_SIGN_URL = process.env.ESIGN_FORM_SIGN_URL;
const LOG_LEVEL = process.env.LOG_LEVEL;
const NUMBER_OF_DIGITS = process.env.NUMBER_OF_DIGITS;
module.exports = {
    REDIS_URL,
    REGISTRY_URL,
    EXPIRE_PROFILE,
    ESIGN_ESP_URL,
    ESIGN_FORM_SIGN_URL,
    LOG_LEVEL,
    NUMBER_OF_DIGITS,
}