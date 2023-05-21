beforeEach(() => {
    console.debug = jest.fn();
    console.error = jest.fn();
});

describe('to create abha from aadhaar number', () => {
    const axios = require('axios').default
    const config = require('../configs/config');
    const { AADHAAR_EXPIRY } = require('../configs/constants')
    const encryptService = require('../services/encrypt.service')
    const sessionService = require('../services/sessions.service')
    const redis = require('../services/redis.service')
    const utils = require('../utils/utils')
    
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    }

    jest.mock('../utils/utils', () => {
        return {
            calculateAge: (date) => {
                return '19'
            },
            getErrorObject: (err) => jest.fn()
        }
    })

    jest.mock('../services/encrypt.service', () => {
        return {
            encryptWithCertificate: (value) => {
                return "mock"+value;
            }
        }
    });
    jest.mock('../services/sessions.service', () => {
        return {
            getClientSecretToken: () => {
                return "token";
            }
        }
    });
    jest.mock('../configs/config', () => {
        return {
            BASE_URL: 'http://localhost:4000',
            EXPIRE_PROFILE: 200
        }
    })
    jest.mock('../configs/constants', () => {
        return {
            AADHAAR_EXPIRY: 100
        }
    });
    jest.mock('../services/redis.service', () => {
        return {
            storeKeyWithExpiry: (key, value, expiry) => jest.fn(),
            getKey: (key) => jest.fn(),
            deleteKey: (key) => jest.fn()
        }
    })
    jest.mock("axios");

    const controller = require('../service/createAbha.service');
    
    test('should generate and send otp to phone number linked to aadhaar', async() => {
        const req = {
            body: {
                aadhaar: 'aadhaarNumber'
            }
        }
        const mockRes = {
            txnId: "abc123"
        }
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve({data: mockRes}))
        jest.spyOn(res, 'json')
        await controller.generateAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/generateOtp', {
            aadhaar: 'mockaadhaarNumber'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(res.json).toHaveBeenCalledWith(mockRes)
    });

    test('should verify otp phone number linked to aadhaar and send abha status as old. return full abha profile', async() => {
        const req = {
            body: {
                otp: 'otp',
                txnId: 'txnId'
            }
        }
        const mockVerify = {
            new: false,
            jwtResponse: {
                token: 'usertoken'
            }
        }
        const mockAbhaProfile = {
            'name': 'Dummy',
            'healthId': 'dummy'
        }
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve({data: mockVerify}))
        jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve({data: mockAbhaProfile}))
        jest.spyOn(res, 'json')
        await controller.verifyAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(axios.get).toHaveBeenCalledWith('http://localhost:4000/v1/account/profile', {
            headers: {
                Authorization: 'Bearer token',
                'X-Token': 'Bearer usertoken' 
            }
        });
        expect(res.json).toHaveBeenCalledWith(mockAbhaProfile)
    });

    test('should verify otp phone number linked to aadhaar and send abha status as new. return transactionId', async() => {
        const req = {
            body: {
                otp: 'otp',
                txnId: 'txnId'
            }
        }
        const mockVerify = {
            new: true,
            birthdate: '19-05-1998',
            txnId: 'txnId',
            name: 'dummy dummy'
        }
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve({data: mockVerify}))
        jest.spyOn(redis, 'storeKeyWithExpiry')
        jest.spyOn(res, 'json')
        await controller.verifyAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith('txnId', "{\"firstName\":\"dummy\",\"middleName\":\"\",\"lastName\":\"dummy\"}", 100)
        expect(res.json).toHaveBeenCalledWith({new: true, txnId: 'txnId'})
    });

    test('should check and send out mobile otp if number entered is not linked to aadhaar', async() => {
        const req = {
            body: {
                txnId: 'txnId',
                mobile: 'mobile'   
            }
        }
        const mockCheckAndGenerateRes = {
            data: {
                mobileLinked: false
            }
        };
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve(mockCheckAndGenerateRes));
        jest.spyOn(res, 'json');
        await controller.checkAndGenerateAbhaOrMobileOTP(req, res);
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/checkAndGenerateMobileOTP', {
            mobile: 'mobile',
            txnId: 'txnId'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        })
        expect(res.json).toHaveBeenCalledWith({mobileLinked: false})
    });

    test('should check and generate abha profile if mobile is linked with aadhaar', async() => {
        const req = {
            body: {
                txnId: 'txnId',
                mobile: 'mobile'   
            }
        }
        const mockCheckAndGenerateRes = {
            data: {
                mobileLinked: true
            }
        };
        const mockAadhaarProfile = "{\"name\": \"Dummy dummy\"}"
        const mockCreateAbhaRes = {
            data: {
                'token': 'abhaToken'
            }
        }
        const mockAbhaProfile = {
            data: {
                healthIdNumber: '919191919191',
                name: 'Dummy dummy'
            }
        }
        const mockAadhaarProfileWithMobile = "{\"name\": \"Dummy dummy\", \"mobile\": \"mobile\"}"
        jest.spyOn(axios, 'post').mockReturnValueOnce(Promise.resolve(mockCheckAndGenerateRes)).mockReturnValueOnce(Promise.resolve(mockCreateAbhaRes));
        jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve(mockAbhaProfile));
        jest.spyOn(res, 'json');
        jest.spyOn(redis, 'getKey').mockReturnValueOnce(Promise.resolve(mockAadhaarProfile)).mockReturnValueOnce(mockAadhaarProfileWithMobile);
        jest.spyOn(redis, 'storeKeyWithExpiry')
        jest.spyOn(redis, 'deleteKey')
        await controller.checkAndGenerateAbhaOrMobileOTP(req, res);
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/checkAndGenerateMobileOTP', {
            mobile: 'mobile',
            txnId: 'txnId'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith('919191919191', "{\"healthIdNumber\":\"919191919191\",\"name\":\"Dummy dummy\"}", 200);
        expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith('txnId', "{\"name\":\"Dummy dummy\",\"mobile\":\"mobile\"}", 100)
        expect(res.json).toHaveBeenCalledWith({healthIdNumber: '919191919191',
        name: 'Dummy dummy'})
        expect(axios.get).toHaveBeenCalledWith('http://localhost:4000/v1/account/profile', {
            headers: {
                Authorization: 'Bearer token',
                'X-Token': 'Bearer abhaToken'
            }
        });
        expect(redis.deleteKey).toHaveBeenCalledWith('txnId')
    });

    test('should verify mobile otp and create abha number', async() => {
        req = {
            body: {
                txnId: 'txnId',
                otp: 'otp'
            }
        };
        const mockCreateAbhaRes = {
            data: {
                'token': 'abhaToken'
            }
        }
        const mockVerifyOtpRes = {
            status: 200
        }
        const mockAbhaProfile = {
            data: {
                healthIdNumber: '919191919191',
                name: 'Dummy dummy'
            }
        }
        const mockAadhaarProfileWithMobile = "{\"name\": \"Dummy dummy\", \"mobile\": \"mobile\"}"
        jest.spyOn(redis, 'getKey').mockReturnValueOnce(mockAadhaarProfileWithMobile);
        jest.spyOn(axios, 'post').mockReturnValueOnce(Promise.resolve(mockVerifyOtpRes)).mockReturnValueOnce(Promise.resolve(mockCreateAbhaRes));
        jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve(mockAbhaProfile))
        jest.spyOn(res, 'json');
        await controller.verifyMobileOTP(req, res);
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyMobileOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v1/registration/aadhaar/createHealthIdWithPreVerified', {
            name: 'Dummy dummy',
            mobile: 'mobile',
            txnId: 'txnId'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(axios.get).toHaveBeenCalledWith('http://localhost:4000/v1/account/profile', {
            headers: {
                Authorization: 'Bearer token',
                'X-Token': 'Bearer abhaToken'
            }
        })
        expect(res.json).toHaveBeenCalledWith({healthIdNumber: '919191919191',name: 'Dummy dummy'})
    });

    test('should return the mobile verification response if it is not success', async() => {
        req = {
            body: {
                txnId: 'txnId',
                otp: 'otp'
            }
        };
        const mockVerifyOtpRes = {
            status: 422,
            data: {
                message: 'Invalid OTP Entered'
            }
        }
        jest.spyOn(res, 'json')
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve(mockVerifyOtpRes));
        await controller.verifyMobileOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyMobileOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(res.json).toHaveBeenCalledWith({message: 'Invalid OTP Entered'})
    });
});

describe('error flows to create abha from aadhaar', () => {
    jest.resetModules();
    const axios = require('axios').default
    const config = require('../configs/config');
    const { AADHAAR_EXPIRY } = require('../configs/constants')
    const encryptService = require('../services/encrypt.service')
    const sessionService = require('../services/sessions.service')
    const redis = require('../services/redis.service')
    const utils = require('../utils/utils')

    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    }

    jest.mock('../utils/utils', () => {
        return {
            calculateAge: (date) => {
                return '17'
            },
            getErrorObject: (err) => jest.fn()
        }
    })

    jest.mock('../services/encrypt.service', () => {
        return {
            encryptWithCertificate: (value) => {
                return "mock"+value;
            }
        }
    });
    jest.mock('../services/sessions.service', () => {
        return {
            getClientSecretToken: () => {
                return "token";
            }
        }
    });
    jest.mock('../configs/config', () => {
        return {
            BASE_URL: 'http://localhost:4000',
            EXPIRE_PROFILE: 200
        }
    })
    jest.mock('../configs/constants', () => {
        return {
            AADHAAR_EXPIRY: 100
        }
    });
    jest.mock('../services/redis.service', () => {
        return {
            storeKeyWithExpiry: (key, value, expiry) => jest.fn(),
            getKey: (key) => jest.fn(),
            deleteKey: (key) => jest.fn()
        }
    })
    jest.mock("axios");

    const controller = require('../service/createAbha.service');

    test('should return error when error in generating otp for aadhaar linked mobile number', async() => {
        const req = {
            body: {
                aadhaar: 'aadhaarNumber'
            }
        }
        const mockRes = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-422',
                    message: 'Unable to process the current request due to incorrect data entered.',
                    details: [{
                        message: 'You have requested multiple OTPs in this transaction. Please try again in 30 minutes.',
                        code: 'HIS-2017',
                        attribute: null
                    }]
                }
            }
        }
        jest.spyOn(axios, 'post').mockReturnValue(Promise.reject(mockRes))
        jest.spyOn(res, 'send')
        jest.spyOn(res, 'status')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            "status": 422,
            "message": "You have requested multiple OTPs in this transaction. Please try again in 30 minutes.",
            "code": "HIS-2017"
        });
        await controller.generateAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/generateOtp', {
            aadhaar: 'mockaadhaarNumber'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.send).toHaveBeenCalledWith({
            "status": 422,
            "message": "You have requested multiple OTPs in this transaction. Please try again in 30 minutes.",
            "code": "HIS-2017"
        })
    });

    test('should return error when wrong otp entered in verifying aadhaar otp', async() => {
        const req = {
            body: {
                otp: 'otp',
                txnId: 'txnId'
            }
        }
        const mockVerify = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-422',
                    message: 'Unable to process the current request due to incorrect data entered.',
                    details: [{
                        message: 'Invalid OTP value.',
                        code: 'HIS-2022',
                        attribute: null
                    }]
                }
            }
        };
        jest.spyOn(axios, 'post').mockReturnValue(Promise.reject(mockVerify))
        jest.spyOn(res, 'status')
        jest.spyOn(res, 'send')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            "status": 422,
            "message": "Invalid OTP value.",
            "code": "HIS-2022"
        });
        await controller.verifyAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.send).toHaveBeenCalledWith({
            "status": 422,
            "message": "Invalid OTP value.",
            "code": "HIS-2022"
        })
    });

    test('should return error when wrong transactionId entered in verifying aadhaar otp', async() => {
        const req = {
            body: {
                otp: 'otp',
                txnId: 'txnId'
            }
        }
        const mockVerify = {
            status: 400,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [{
                        message: 'Please enter a valid UUID Number.',
                        code: 'HIS-1012',
                        attribute: [Object]
                    }]
                }
            }
        };
        jest.spyOn(axios, 'post').mockReturnValue(Promise.reject(mockVerify))
        jest.spyOn(res, 'status')
        jest.spyOn(res, 'send')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            "status": 400,
            "message": "Please enter valid transaction Id",
            "code": "HIS-1012"
        });
        await controller.verifyAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.send).toHaveBeenCalledWith({
            "status": 400,
            "message": "Please enter valid transaction Id",
            "code": "HIS-1012"
        })
    });

    test('should verify otp phone number linked to aadhaar send error as age is less than 18', async() => {
        const req = {
            body: {
                otp: 'otp',
                txnId: 'txnId'
            }
        }
        const mockVerify = {
            new: true,
            birthdate: '19-05-1998',
            txnId: 'txnId',
            name: 'dummy dummy'
        }
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve({data: mockVerify}))
        jest.spyOn(redis, 'storeKeyWithExpiry')
        jest.spyOn(res, 'status')
        jest.spyOn(res, 'send')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            status: 403,
            message: 'Please check back and registry with us when you are 18.',
            code: ''
        });
        await controller.verifyAadhaarOTP(req, res)
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/verifyOTP', {
            txnId: 'txnId',
            otp: 'mockotp'
        }, {
            headers: {
                Authorization: 'Bearer token' 
            }
        });
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({
            status: 403,
            message: 'Please check back and registry with us when you are 18.',
            code: ''
        });
    });

    test('should return error when wrong transactionId in checkAndGenerateAbhaOrMobileOTP', async() => {
        const req = {
            body: {
                txnId: 'txnId',
                mobile: 'mobile'   
            }
        }
        const mockCheckAndGenerateRes = {
            status: 400,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                      {
                        message: 'Please enter a valid UUID Number.',
                        code: 'HIS-1012',
                        attribute: []
                      }
                    ]
                }
            }
        };
        jest.spyOn(axios, 'post').mockReturnValue(Promise.reject(mockCheckAndGenerateRes));
        jest.spyOn(res, 'status')
        jest.spyOn(res, 'send')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            "status": 400,
            "message": "Please enter valid transaction Id",
            "code": "HIS-1012"
        });
        await controller.checkAndGenerateAbhaOrMobileOTP(req, res);
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/checkAndGenerateMobileOTP', {
            mobile: 'mobile',
            txnId: 'txnId'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            "status": 400,
            "message": "Please enter valid transaction Id",
            "code": "HIS-1012"
        })
    });

    test('should return error when used transactionId given in checkAndGenerateAbhaOrMobileOTP', async() => {
        const req = {
            body: {
                txnId: 'txnId',
                mobile: 'mobile'   
            }
        }
        const mockCheckAndGenerateRes = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-422',
                    message: 'Unable to process the current request due to incorrect data entered.',
                    details: [{
                        message: 'Transaction not found for UUID.',
                        code: 'HIS-1026',
                        attribute: null
                    }]
                }
            }
        };
        jest.spyOn(axios, 'post').mockReturnValue(Promise.reject(mockCheckAndGenerateRes));
        jest.spyOn(res, 'status')
        jest.spyOn(res, 'send')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            "status": 422,
            "message": "Transaction not found for UUID.",
            "code": "HIS-1026"
        });
        await controller.checkAndGenerateAbhaOrMobileOTP(req, res);
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/checkAndGenerateMobileOTP', {
            mobile: 'mobile',
            txnId: 'txnId'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.send).toHaveBeenCalledWith({
            "status": 422,
            "message": "Transaction not found for UUID.",
            "code": "HIS-1026"
        })
    });

    test('should return error when invalid mobile number entered in checkAndGenerateAbhaOrMobileOTP', async() => {
        const req = {
            body: {
                txnId: 'txnId',
                mobile: 'mobile'   
            }
        }
        const mockCheckAndGenerateRes = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                        {
                        message: 'Please enter a valid Mobile Number.',
                        code: 'HIS-1011',
                        attribute: [Object]
                        }
                    ]
                }
            }
        };
        jest.spyOn(axios, 'post').mockReturnValue(Promise.reject(mockCheckAndGenerateRes));
        jest.spyOn(res, 'status')
        jest.spyOn(res, 'send')
        jest.spyOn(utils, 'getErrorObject').mockReturnValue({
            "status": 422,
            "message": "Please enter a valid Mobile Number.",
            "code": "HIS-1011"
        });
        await controller.checkAndGenerateAbhaOrMobileOTP(req, res);
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/v2/registration/aadhaar/checkAndGenerateMobileOTP', {
            mobile: 'mobile',
            txnId: 'txnId'
        }, {
            headers: {
                Authorization: 'Bearer token'
            }
        });
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.send).toHaveBeenCalledWith({
            "status": 422,
            "message": "Please enter a valid Mobile Number.",
            "code": "HIS-1011"
        })
    });
});