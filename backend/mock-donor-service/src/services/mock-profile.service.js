const randomProfiles = require('./profiles.json');
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



module.exports = {
    getRandomMockProfile,
    isMockProfilePresent
}