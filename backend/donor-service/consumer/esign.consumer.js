const { Kafka } = require('kafkajs');
const redis = require('../services/redis.service');
const config = require('../configs/config')

const initSubscription = async () => {
    const kafka = new Kafka ({
        // brokers: config.ABDM_KAFKA.split(",")
        // 100.65.159.43:5101
        brokers: ['pkc-lq8v7.eu-central-1.aws.confluent.cloud:9092']
    });
    consumer = kafka.consumer({groupId: 'notto_esign_group_1'});
    await consumer.subscribe({topic: 'esign_topic', fromBeginning: true});
    console.log("Init the logic kafka connection ")
    console.log(consumer);
    return consumer
}

const readEsignMessage = async(consumer) => {
    await consumer.run({
      autoCommit: false,
      eachMessage: processEachMessage
    });
};

const processEachMessage = async ({ message }) => {
  try {
    const esignData = JSON.parse(message.value.toString());
    const enteredData = await redis.getHash(esignData.transactionId.split('.')[0])
    if(Object.keys(enteredData).length !== 0) {
      const status = getEsignDataMatchStatus(enteredData, esignData);
      await redis.storeHashWithExpiry(esignData.transactionId.split('.')[0] + "-esign-verification", 'status', status, config.EXPIRE_ESIGN_VALID_STATUS)
    } else {
      console.debug("Entered Data is null");
    }
  } catch(err) {
    console.error(err)
  }
}

const getEsignDataMatchStatus = (enteredData, esignData) => {
  const isEsignValid = isEsignDataMatch(enteredData, esignData);
  console.debug("isEsignDataMatch", isEsignValid)
  return isEsignValid ? config.ESIGN_STATUS.SUCCESS : config.ESIGN_STATUS.FAILED
}

const isEsignDataMatch = (verificationData, dataFromEsignCallback) => {
  return ((dataFromEsignCallback.name).indexOf(verificationData.firstName) >= 0 && (dataFromEsignCallback.name).indexOf(verificationData.lastName) >= 0 && dataFromEsignCallback.pincode === verificationData.pincode && verificationData.dob.indexOf(dataFromEsignCallback.yob) >= 0);
}

module.exports = {
    initSubscription,
    readEsignMessage
}