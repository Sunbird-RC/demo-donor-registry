// const {ClickHouse} = require('clickhouse');

// // Create a ClickHouse instance
// const clickhouse = new ClickHouse({
//   url: 'http://192.168.96.7:8123',
//   debug: false,
// });

// const jsonData = {
//     testData: 1
//   };
  
//   // Convert the JSON object to a JSON string
//   const jsonString = JSON.stringify(jsonData);
  
//   // Define the INSERT query using JSONEachRow format
//   const query = `
//     INSERT INTO pledge (operationType, entity, createdAt, id)
//     FORMAT JSONEachRow
//     VALUES ('ADD', JSONEachRow('${jsonString}'), '2023-08-10' ,'b6189f8f-9ef3-499f-961b-94bdd540f3cd')
//   `;

// // Define a SQL query
// // const query = `INSERT INTO pledge (operationType, entity, createdAt, id) FORMAT JSONEachRow VALUES ('ADD', JSONEachRow('{"testData": 1}'), '2023-08-10' ,'b6189f8f-9ef3-499f-961b-94bdd540f3cd')`;

// // Execute the query
// clickhouse.query(query).toPromise()
//   .then(result => {
//     console.log('Query result:', result);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });


const axios = require('axios');

// ClickHouse server URL
const clickhouseUrl = 'http://192.168.96.7:8123';

// JSON data to insert
const jsonData = {
  operationType: 'ADD',
  entity: { testData: 1 },
  createdAt: '2023-08-10',
  id: 'b6189f8f-9ef3-499f-961b-94bdd540f3cd'
};

// Send the POST request to ClickHouse
axios.post(`${clickhouseUrl}/?query=INSERT INTO pledge`, jsonData, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Insertion successful:', response.data);
})
.catch(error => {
  console.error('Insertion failed:', error.message);
});


//////////////////// The below code is working 


// const clickhouseUrl = 'http://clickhouse:8123';

// // JSON data to insert
// const jsonData = {
// operationType: 'ADD',
// entity: { testData: 1 },
// createdAt: '2023-08-10',
// id: 'b6189f8f-9ef3-499f-961b-94bdd540f3cd'
// };

// const formattedData = JSON.stringify([jsonData]);

// // Send the POST request to ClickHouse
// let resposne = await axios.post(`${clickhouseUrl}/?query=INSERT INTO pledge FORMAT JSONEachRow`, formattedData,{
// headers: {
//     'Content-Type': 'application/json'
// }
// })
// console.log('Insertion successful:', resposne.data);






/////////////// ------------------------------------------------------------------------- 



// await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

// This is the working code for producer --->  


// const kafka = new Kafka({
//   clientId: 'test-For-DB-Migration',
//   brokers: ['kafka:9092'], // List your Kafka brokers
//   createPartitioner: Partitioners.LegacyPartitioner
// });

// const producer = kafka.producer();

//   // Topic name
// const topic = 'events'; // Change to your topic name

// // Connect and send the event
// await producer.connect();

// // Produce the message
// await producer.send({
//   topic,
//   messages: [
//   {
//       value: JSON.stringify(telemetryEvent)
//   }
//   ]
// });

// await producer.disconnect();

// console.log('kafka ran succesfully!!');


// let producer = null;
// const initProducerSubscription = async () => {
//   try {

//     const kafka = new Kafka({
//       clientId: 'test-For-DB-Migration',
//       brokers: config.ESIGN_VALIDATION_KAFKA_BROKERS?.split(","), // List your Kafka brokers
//       createPartitioner: Partitioners.LegacyPartitioner
//     });
//     producer = kafka.producer();
//     console.log("Initialised the kafka connection ");
//   } catch (e) {
//       console.log("Failed to initialise Kafka consumer ", e);
//   }
// }



// ClickHouse server URL
// Function to execute a query
async function executeQuery(query) {
  try {
    const result = await clickhouse.query(query).toPromise();
    console.log('Query result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}


