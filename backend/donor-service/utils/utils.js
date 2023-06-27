const R = require('ramda')
const {SOCIAL_SHARE_PROPERTY_PATHS_MAP, SOCIAL_SHARE_TEMPLATE_MAP, PLEDGE_STATUS} = require("../configs/constants");
const { getPledgeStatus } = require('../services/abhaProfile.service');
function calculateAge(date) {
    const formattedDate = date.split("-");
    const birthdateTimeStamp = new Date(formattedDate[2], parseInt(formattedDate[1]) - 1, formattedDate[0]);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthdateTimeStamp.getFullYear();
    const monthDifference = currentDate.getMonth() - birthdateTimeStamp.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthdateTimeStamp.getDate())) {
        age--;
    }
    return age;
}

function getErrorObject(err) {
    console.debug(err);
    let message;
    let status = err?.response?.status || err?.status || 500
    console.error(R.pathOr("", ["response","data"], err));
    switch (R.pathOr("", ["response","data","details",0,"code"], err)) {
        case 'HIS-1008':
            message = "Please enter valid ABHA Number";
            break;
        case 'HIS-1023':
            message = R.pathOr("Please wait for 30 minutes to try again with same ABHA number", ["response","data","details",0,"message"], err);
            break;
        case 'HIS-1039':
            message = 'You have exceeded the maximum limit of failed attempts. Please try again in 12 hours';
            status = 429;
            break;
        case 'HIS-1013':
            message = 'Please enter correct OTP number';
            status = 401;
            break;
        case 'HIS-1012':
            message = 'Please enter valid transaction Id'
            break;
        case 'HIS-1026':
        case 'HIS-1011':
        case 'HIS-2022':
        case 'HIS-2017':
        case 'HIS-1041':
            message = R.pathOr("", ["response","data","details",0,"message"], err)
            break;
        default:
            message = err?.message || err?.response?.data || err;
            break;
    }
    if(err?.response?.data?.code === 'HIS-500'){
        message = "Please enter valid ABHA Number";
    }
    return {
        status: status,
        message: message.replaceAll("#", ""),
        code: R.pathOr("", ["response","data","details",0,"code"], err)
    };
}

const convertToSocialShareResponse = (entityName, userData) => {
    if(R.path([entityName], SOCIAL_SHARE_PROPERTY_PATHS_MAP) === undefined) {
        throw new Error("Social shareable property path not found");
    }
    return R.paths(R.pathOr([], [entityName], SOCIAL_SHARE_PROPERTY_PATHS_MAP), userData)
        .reduce((res, value, i) => {
            return R.assocPath(R.path([entityName, i], SOCIAL_SHARE_PROPERTY_PATHS_MAP), value, res);
        }, {});
}

async function checkForPledgeStatusAndReturnError (abhaNumber) {
    let pledgeStatus = await getPledgeStatus(abhaNumber);
    switch(pledgeStatus) {
        case PLEDGE_STATUS.PLEDGED : 
            throw {
                status: 409,
                message: 'You have already registered as a pledger. Please login to view and download pledge certificate',
                response :{
                    data:{ 
                        details:[{"code": pledgeStatus}]
                    }
                }
            }
        case PLEDGE_STATUS.UNPLEDGED : 
            throw {
                status: 409,
                message: 'You have unpledged your exisitng pledge. Please login to update the pledge',
                response :{
                    data:{ 
                        details:[{"code": pledgeStatus}]
                    }
                }
            }
        case PLEDGE_STATUS.NOTPLEDGED :{
            throw {
                status: 409,
                message: 'Please register as a pleder by loging in.',
                response :{
                    data:{ 
                        details:[{"code": pledgeStatus}]
                    }
                }
            }
        }
        default : {
            throw {
                status: 409,
                message: 'You have already registered as a pledger. Please login to view and download pledge certificate',
                response :{
                    data:{ 
                        details:[{"code": PLEDGE_STATUS.PLEDGED}]
                    }
                }
            }
        }
    } 
}

module.exports = {
    calculateAge,
    getErrorObject,
    convertToSocialShareResponse,
    checkForPledgeStatusAndReturnError
}
