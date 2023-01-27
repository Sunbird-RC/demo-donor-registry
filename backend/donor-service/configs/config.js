const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BASE_URL = process.env.BASE_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const ESIGN_ESP_URL = process.env.ESIGN_ESP_URL || 'https://digisignsbx.abdm.gov.in/digiSign/genEspRequest';
const ESIGN_FORM_SIGN_URL = process.env.ESIGN_FORM_SIGN_URL || "https://es-staging.cdac.in/esignlevel1/2.1/form/signdoc";
module.exports = {
    REDIS_URL,
    BASE_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    ESIGN_ESP_URL,
    ESIGN_FORM_SIGN_URL
}
