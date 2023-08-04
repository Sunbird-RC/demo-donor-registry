const { Kafka } = require('kafkajs');
const redis = require('../services/redis.service');
const config = require('../configs/config');

let consumer = null;

function getEsignVerificationKey(transactionId) {
    return `${transactionId}-esign-verification`;
}
const initSubscription = async () => {
    const kafka = new Kafka ({
        brokers: config.ABDM_KAFKA.split(",")
        // 100.65.159.43:5101
        // pkc-lq8v7.eu-central-1.aws.confluent.cloud:9092
        // brokers: ['localhost:9092']
    });
    consumer = kafka.consumer({groupId: 'notto_esign_group_1'});
    await consumer.subscribe({topic: 'esign_topic', fromBeginning: false });
    await consumer.run({
        autoCommit: false,
        eachMessage: processEachMessage
    });
    console.log("Initialised the kafka connection ");
}

const processEachMessage = async ({ message }) => {
    try {
        const esignData = JSON.parse(message.value.toString());
        const esignVerificationKey = getEsignVerificationKey(esignData.transactionId.split('.')[0]);
        const enteredData = await redis.getHash()
        if(Object.keys(enteredData).length !== 0) {
            const status = getEsignDataMatchStatus(enteredData, esignData);
            if(status.errors.length > 0 ) {
                await redis.storeHashWithExpiry(esignVerificationKey, 'esignErrors', JSON.stringify(status.errors), config.EXPIRE_ESIGN_VALID_STATUS)
                console.log("error validating esign data: ", status);
            }
            await redis.storeHashWithExpiry(esignVerificationKey, 'esignStatus', status?.esign, config.EXPIRE_ESIGN_VALID_STATUS)
        } else {
            console.log("Entered Data is null");
        }
    } catch(err) {
        console.log(err)
    }
}

const getEsignDataMatchStatus = (enteredData, esignData) => {
    const errors = [];
    const error = (msg, esignField, originalField) => {
        errors.push(`${msg}, esign '${esignField}' and original '${originalField}'`);
    }
    if(!esignData?.signed) errors.push("Sign unsuccessful");
    if(enteredData.dob?.indexOf(esignData?.yob) < 0) error("Year of birth not matched", esignData?.yob, enteredData?.dob?.split("-")[0]);
    if(enteredData.pincode !== esignData.pincode) error("Pincode not matched", esignData?.pincode, enteredData?.pincode);
    if(!!esignData?.name) {
        const names = esignData?.name?.split(" ");
        if(!names || names.length < 1) errors.push("Name not found in Esign data");
        if(enteredData?.firstName !== names[0]) error("First name not matched", names[0], enteredData?.firstName);
        if(names.length === 3 && names[1] !== enteredData?.middleName) error("Middle name not matched", names[1], enteredData?.middleName);
        if(names.length === 3 && names[2] !== enteredData?.lastName) error("Last name not matched", names[2], enteredData?.lastName);
        if(names.length === 2 && names[1] !== enteredData?.lastName) error("Last name not matched", names[1], enteredData?.lastName);
        if(names.length === 2 && !!enteredData?.middleName) error("Middle name not matched", "", enteredData?.middleName);
        if(names.length === 1 && (!!enteredData?.middleName || !!enteredData.lastName)) errors.push("middle name or last name not found in esign data");
    }
    return {
        esign: errors.length === 0 ? config.ESIGN_STATUS.SUCCESS.toString() : config.ESIGN_STATUS.FAILED.toString(),
        errors: errors,
    };
}

module.exports = {
    initSubscription,
    getEsignVerificationKey,
}