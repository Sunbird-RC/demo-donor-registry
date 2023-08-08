const { Kafka } = require('kafkajs');
const redis = require('../services/redis.service');
const config = require('../configs/config');

let consumer = null;

function getEsignVerificationKey(transactionId) {
    return `${transactionId}-esign-verification`;
}
const initSubscription = async () => {
    try {
        const kafka = new Kafka ({
            clientId: config.ESIGN_VALIDATION_CLIENT_ID,
            brokers: config.ESIGN_VALIDATION_KAFKA_BROKERS?.split(",")
        });
        consumer = kafka.consumer({groupId: config.ESIGN_VALIDATION_KAFKA_TOPIC_GROUP});
        await consumer.subscribe({topic: config.ESIGN_VALIDATION_KAFKA_TOPIC, fromBeginning: false });
        await consumer.run({
            autoCommit: true,
            eachMessage: processEachMessage
        });
        console.log("Initialised the kafka connection ");
    } catch (e) {
        console.log("Failed to initialise Kafka consumer ", e);
    }
}

const processEachMessage = async ({ message }) => {
    try {
        const esignData = JSON.parse(message.value.toString());
        console.log("Received Kafka message: ", esignData);
        const esignVerificationKey = getEsignVerificationKey(esignData.transactionId.split('.')[0]);
        console.debug("Esign Verification Key: ", esignVerificationKey);
        const enteredData = await redis.getHash(esignVerificationKey);
        console.debug("Entered Data Was: ", enteredData);
        if(Object.keys(enteredData).length !== 0) {
            const status = getEsignDataMatchStatus(enteredData, esignData);
            if(status.errors.length > 0 ) {
                await redis.storeHashWithExpiry(esignVerificationKey, 'esignErrors', JSON.stringify(status.errors), config.ESIGN_VALIDATION_EXPIRE_TIME)
                console.log("error validating esign data: ", status);
            }
            await redis.storeHashWithExpiry(esignVerificationKey, 'esignStatus', status?.esign, config.ESIGN_VALIDATION_EXPIRE_TIME)
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