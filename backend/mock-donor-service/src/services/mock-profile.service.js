const {photo} = require('./photo')
const getRandomMockProfile = (abha = null) => {
    if(abha === undefined) return null;
    if(abha === null) {
        const range = randomProfiles.length;
        const index = Math.floor(Math.random() * range);
        return randomProfiles[index];
    } else if(randomProfiles.filter(profile => profile.healthIdNumber.replace(/-/g, '') === abha).length > 0) {
        return randomProfiles.filter(profile => profile.healthIdNumber.replace(/-/g, '') === abha)[0]
    } 
    return null;
}

const isMockProfilePresent = (abha) => {
    return randomProfiles.filter(profile => profile.healthIdNumber.replace(/-/g, '') === abha).length > 0
}

const randomProfiles = [
    {
        "healthIdNumber": "91-3075-5157-3552",
        "healthId": null,
        "firstName": "John1",
        "middleName": "",
        "lastName": "Doe",
        "name": "John Doe",
        "yearOfBirth": "1995",
        "dayOfBirth": "15",
        "monthOfBirth": "11",
        "gender": "M",
        "email": null,
        "profilePhoto": photo,
        "stateCode": "27",
        "districtCode": "469",
        "subDistrictCode": null,
        "villageCode": null,
        "townCode": null,
        "wardCode": null,
        "pincode": "431005",
        "address": "C/O Aurangabad",
        "kycPhoto": null,
        "stateName": "MAHARASHTRA",
        "districtName": "Aurangabad",
        "subdistrictName": null,
        "villageName": null,
        "townName": "Aurangabad",
        "wardName": null,
        "authMethods": [
            "AADHAAR_OTP",
            "MOBILE_OTP",
            "DEMOGRAPHICS",
            "AADHAAR_BIO"
        ],
        "tags": {},
        "kycVerified": true,
        "verificationStatus": null,
        "verificationType": null,
        "clientId": "SBX_002738",
        "phrAddress": null,
        "new": false,
        "emailVerified": false
    },
    {
        "healthIdNumber": "91-3075-5157-3553",
        "healthId": null,
        "firstName": "John2",
        "middleName": "",
        "lastName": "Doe",
        "name": "John Doe",
        "yearOfBirth": "1995",
        "dayOfBirth": "15",
        "monthOfBirth": "11",
        "gender": "M",
        "email": null,
        "profilePhoto": photo,
        "stateCode": "27",
        "districtCode": "469",
        "subDistrictCode": null,
        "villageCode": null,
        "townCode": null,
        "wardCode": null,
        "pincode": "431005",
        "address": "C/O Aurangabad",
        "kycPhoto": null,
        "stateName": "MAHARASHTRA",
        "districtName": "Aurangabad",
        "subdistrictName": null,
        "villageName": null,
        "townName": "Aurangabad",
        "wardName": null,
        "authMethods": [
            "AADHAAR_OTP",
            "MOBILE_OTP",
            "DEMOGRAPHICS",
            "AADHAAR_BIO"
        ],
        "tags": {},
        "kycVerified": true,
        "verificationStatus": null,
        "verificationType": null,
        "clientId": "SBX_002738",
        "phrAddress": null,
        "new": false,
        "emailVerified": false
    },
    {
        "healthIdNumber": "91-3075-5157-3554",
        "healthId": null,
        "firstName": "John3",
        "middleName": "",
        "lastName": "Doe",
        "name": "John Doe",
        "yearOfBirth": "1995",
        "dayOfBirth": "15",
        "monthOfBirth": "11",
        "gender": "M",
        "email": null,
        "profilePhoto": photo,
        "stateCode": "27",
        "districtCode": "469",
        "subDistrictCode": null,
        "villageCode": null,
        "townCode": null,
        "wardCode": null,
        "pincode": "431005",
        "address": "C/O Aurangabad",
        "kycPhoto": null,
        "stateName": "MAHARASHTRA",
        "districtName": "Aurangabad",
        "subdistrictName": null,
        "villageName": null,
        "townName": "Aurangabad",
        "wardName": null,
        "authMethods": [
            "AADHAAR_OTP",
            "MOBILE_OTP",
            "DEMOGRAPHICS",
            "AADHAAR_BIO"
        ],
        "tags": {},
        "kycVerified": true,
        "verificationStatus": null,
        "verificationType": null,
        "clientId": "SBX_002738",
        "phrAddress": null,
        "new": false,
        "emailVerified": false
    }
]

module.exports = {
    getRandomMockProfile,
    isMockProfilePresent
}