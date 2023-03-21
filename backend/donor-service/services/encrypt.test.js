const {encrypt, encryptWithCertificate, decrypt} = require("./encrypt.service");
const axios = require('axios').default;

jest.mock('axios');

const publicCertificate = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCfIo1E0JsT3VIK/bixRD74hoaUz+8mv0/qkxUX5CqUfqpf8unX1B2KdjzEEaME1LXwTNsaTxTUtOtiRRkoOoIwTV6UbhZpFNPt9x2J8y711jzkEicW7F6T3bH1Vz+9HeKIQmlpQieBFw1Cur52rN7XAeLnEKxV4OxtIx8yCOqtyQIDAQAB
-----END PUBLIC KEY-----
`;
const privateCertificate = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJ8ijUTQmxPdUgr9uLFEPviGhpTP7ya/T+qTFRfkKpR+ql/y6dfUHYp2PMQRowTUtfBM2xpPFNS062JFGSg6gjBNXpRuFmkU0+33HYnzLvXWPOQSJxbsXpPdsfVXP70d4ohCaWlCJ4EXDUK6vnas3tcB4ucQrFXg7G0jHzII6q3JAgMBAAECgYAeBPuXTq7ieW6/qgtMTW5/nYkHy432xkJCIwrond82cgqb3Qwl7drAwvtFlXomMCY+NZFjjiWE1rhMqnJLd3YVbwT3WMKdN5mi9ccetI3w54Kn6x6XSlfOOKcuB937iQyjJLCjizSmT8R0CesKl9R3qdSf9FkXI00QtIiPAP9h8QJBAPR8uDPO6c8JCCK/RbIebZ3KdKJfpY7afTjOc+zY9MZVCKSSeasqUX3nvJs9KHGCqOXT/Fb9gwPet45zO/EWn3UCQQCmoOpq5mcaah9i5HqjKSSm8snuPx7Zdz0LxfFLVz55d5Yo3tygHeRnFQD4Pjmm3op01/xeQsPH3bsuEDaVbb6FAkEAxed3TCi/xqFu/oGKL0bGQKYzh4SZBWwDVUp5OE3exfTrTBxtdIqK8Ln3SEpXRJsZkQDqEJihxy4vs5W//cXsSQJAS9nKfBkf7AVM/k51iRpshdbVly+CkonV7ysPGTXAybhnUXmJwxV4aHhGNbrVsaFyM5gyWJJZ3vyPfXuB7WnEpQJBAKSag8hR/Vann86dn/GojRg3Uf055/wNXrCzFxj2UnYzMbrwGUact9R1o+qMG9jVd11VP3BSCJFVodlWZmxb/0M=
-----END PRIVATE KEY-----`;

describe('encryption service test', () => {
    let mockedAxios;
    beforeAll(() => {
        jest.resetModules();
        jest.resetAllMocks();
        mockedAxios = axios;

    });
    test('should encrypt text with given certificate', async () => {

        let encryptedText = encrypt("1234", publicCertificate);
        console.log(encryptedText)
        expect(encryptedText).toBeTruthy()
    })

    test('should encrypt and decrypt', async () => {

        let encryptedText = encrypt("1234", publicCertificate);
        console.log(encryptedText)
        expect(encryptedText).toBeTruthy()
        const decryptedText = decrypt(encryptedText, privateCertificate)
        expect(decryptedText).toBe("1234")
    })

    test('should encrypt text and get certificate from api', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
            Promise.resolve({
                data: publicCertificate
            })
        );
        let encryptedText = encryptWithCertificate("1234");
        console.log(encryptedText)
        expect(encryptedText).toBeTruthy()
    })

})
