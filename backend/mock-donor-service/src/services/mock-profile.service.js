const randomProfiles = require('./profiles.json');
const getRandomMockProfile = (abha = null) => {
    if(abha === undefined) return null;
    if(abha === null) {
        const range = randomProfiles.length;
        const index = Math.floor(Math.random() * range);
        randomProfiles[index]["healthIdNumber"] = generateRandomABHA();
        randomProfiles[index]["mobile"] = generateRandomMobileNumber();
        return randomProfiles[index];
    } else if(randomProfiles.filter(profile => profile.healthIdNumber.replace(/-/g, '') === abha).length > 0) {
        return randomProfiles.filter(profile => profile.healthIdNumber.replace(/-/g, '') === abha)[0]
    } 
    return null;
}


function generateRandomABHA() {
    let result = '';
    // Generate random prefix in the range of 10-99
    const prefix = Math.floor(Math.random() * 90) + 10;
    result += prefix + '-';
    // Generate random numbers in the format xxxx-xxxx-xxxx
    for (let i = 0; i < 3; i++) {
        result += Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        if (i < 2) result += '-';
    }
    return result;
}

function generateRandomMobileNumber() {
    let phoneNumber = '9'; // Start with 9 to ensure it's a valid mobile number
    for (let i = 1; i < 10; i++) {
        phoneNumber += Math.floor(Math.random() * 10);
    }
    return phoneNumber;
}


const isMockProfilePresent = (abha) => {
    return randomProfiles.filter(profile => profile.healthIdNumber.replace(/-/g, '') === abha).length > 0
}



module.exports = {
    getRandomMockProfile,
    isMockProfilePresent,
    generateRandomABHA
}