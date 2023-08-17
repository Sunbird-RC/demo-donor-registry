const config = require('../configs/config');
const { Kafka, Partitioners } = require('kafkajs');

// Connect and send the event
async function produceEventToKafka(topic, telemetryEvent) {

const kafka = new Kafka({
  clientId: 'test-For-DB-Migration',
  brokers: config.KAFKA_BROKER?.split(","), // List your Kafka brokers
  createPartitioner: Partitioners.LegacyPartitioner
});

const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(telemetryEvent)
      }
    ]
  });

  await producer.disconnect();
}

module.exports = {
  produceEventToKafka
}

