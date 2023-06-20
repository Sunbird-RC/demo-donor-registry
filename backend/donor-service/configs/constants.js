const GENDER_MAP = {'M': 'Male', 'F': 'Female', 'T': 'Transgender'}
const SOCIAL_SHARE_PROPERTY_PATHS_MAP = {
    Pledge: [
        ["personalDetails", "firstName"],
        ["personalDetails", "middleName"],
        ["personalDetails", "lastName"],
    ]
}
const SOCIAL_SHARE_TEMPLATE_MAP = require("./social-media.json");
module.exports = {
    GENDER_MAP,
    SOCIAL_SHARE_PROPERTY_PATHS_MAP,
    SOCIAL_SHARE_TEMPLATE_MAP,
}
