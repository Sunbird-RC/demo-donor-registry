const GENDER_MAP = {'M': 'Male', 'F': 'Female', 'T': 'Transgender'}
const SOCIAL_SHARE_PROPERTY_PATHS_MAP = {
    Pledge: [
        ["personalDetails", "firstName"],
        ["personalDetails", "middleName"],
        ["personalDetails", "lastName"],
    ]
}
const SOCIAL_SHARE_TEMPLATE_MAP = {
    Pledge: {
        '1': "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/social_templates/1.svg"
    }
}
module.exports = {
    GENDER_MAP,
    SOCIAL_SHARE_PROPERTY_PATHS_MAP,
    SOCIAL_SHARE_TEMPLATE_MAP,
}
