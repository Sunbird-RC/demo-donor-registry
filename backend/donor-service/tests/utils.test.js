beforeEach(() => {

});

describe('test utils package',  () => {

    const utils = require('../utils/utils');

    test('get correct age i.e less than 18 for date of birth', () => {
        const date = '21-05-2010';
        const expectedAge = 13;
        const actualAge = utils.calculateAge(date);
        expect(actualAge).toEqual(expectedAge);
    });

    test('get correct age i.e greater than 18 for date of birth', () => {
        const date = '21-05-1998';
        const expectedAge = 25;
        const actualAge = utils.calculateAge(date);
        expect(actualAge).toEqual(expectedAge);
    });

    describe("Social Share response conversion", () => {
        const socialMediaShareTests = [
            {
                "scenario": "Only requested fields are selected in response",
                "entityName": "Pledge",
                "userData": {
                    "personalDetails": {
                        "firstName": "John",
                        "middleName": "mark",
                        "lastName": "clark",
                        "age": 19
                    },
                    "IdentificationDetails": {
                        "abha": "123123123123",
                        "nottoId": "234234134"
                    }
                },
                "expected": {
                    "personalDetails": {
                        "firstName": "John",
                        "middleName": "mark",
                        "lastName": "clark"
                    }
                }
            },
            {
                "scenario": "Entity name is not present in the user data",
                "entityName": "Pledge1",
                "userData": {
                },
                "errorMessage": "Social shareable property path not found",
                "expectError": true
            },
            {
                "scenario": "Personal details key is present in the user data",
                "entityName": "Pledge",
                "userData": {
                    "IdentificationDetails": {
                        "abha": "123123123123",
                        "nottoId": "234234134"
                    }
                },
                "expected": {
                    "personalDetails": {
                        "firstName": undefined,
                        "middleName": undefined,
                        "lastName": undefined
                    }
                }
            },
            {
                "scenario": "No key is present in the user data",
                "entityName": "Pledge",
                "userData": {
                    "personalDetails": {
                        "age": 19
                    },
                    "IdentificationDetails": {
                        "abha": "123123123123",
                        "nottoId": "234234134"
                    }
                },
                "expected": {
                    "personalDetails": {
                        "firstName": undefined,
                        "middleName": undefined,
                        "lastName": undefined
                    }
                }
            },
            {
                "scenario": "First name is not present in the user data",
                "entityName": "Pledge",
                "userData": {
                    "personalDetails": {
                        "middleName": "mark",
                        "lastName": "clark",
                        "age": 19
                    },
                    "IdentificationDetails": {
                        "abha": "123123123123",
                        "nottoId": "234234134"
                    }
                },
                "expected": {
                    "personalDetails": {
                        "firstName": undefined,
                        "middleName": "mark",
                        "lastName": "clark",
                    }
                }
            }
        ]
        for (let i in socialMediaShareTests) {
            const { scenario, entityName, userData, expected, expectError, errorMessage } = socialMediaShareTests[i];
            test(scenario, () => {
                if (expectError) {
                    expect(() => utils.convertToSocialShareResponse(entityName, userData))
                        .toThrow(errorMessage);
                } else {
                    const actualResponse = utils.convertToSocialShareResponse(entityName, userData);
                    expect(actualResponse).toEqual(expected);
                }
            });
        }
    })

    test('get appropriate error object for multiple OTPs requested', () => {
        const err = {
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
        };
        const expectedErrorObject = {
            message: "You have requested multiple OTPs in this transaction. Please try again in 30 minutes.",
            status: 422,
            code: "HIS-2017"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for invalid otp requested', () => {
        const err = {
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
        const expectedErrorObject = {
            message: "Invalid OTP value.",
            status: 422,
            code: "HIS-2022"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for wrong transactionId entered while verifying aadhaar otp', () => {
        const err = {
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
        const expectedErrorObject = {
            message: "Please enter valid transaction Id",
            status: 400,
            code: "HIS-1012"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for wrong transactionId entered while checkingAndGeneratingAbhaOrMobileOTP', () => {
        const err = {
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
        const expectedErrorObject = {
            message: "Please enter valid transaction Id",
            status: 400,
            code: "HIS-1012"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for used transactionId entered while checkingAndGeneratingAbhaOrMobileOTP', () => {
        const err = {
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
        const expectedErrorObject = {
            message: "Transaction not found for UUID.",
            status: 422,
            code: "HIS-1026"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for invalid mobile number entered while checkingAndGeneratingAbhaOrMobileOTP', () => {
        const err = {
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
        const expectedErrorObject = {
            message: "Please enter a valid Mobile Number.",
            status: 422,
            code: "HIS-1011"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for invalid abha number', () => {
        const err = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-500',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                        {
                        message: '',
                        code: 'HIS-1008',
                        attribute: {}
                        }
                    ]
                }
            }
        };
        const expectedErrorObject = {
            message: "Please enter valid ABHA Number",
            status: 422,
            code: "HIS-1008"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for maximum failed otp attempts', () => {
        const err = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                        {
                        message: '',
                        code: 'HIS-1039',
                        attribute: {}
                        }
                    ]
                }
            }
        };
        const expectedErrorObject = {
            message: "You have exceeded the maximum limit of failed attempts. Please try again in 12 hours",
            status: 429,
            code: "HIS-1039"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for maximum failed otp attempts', () => {
        const err = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                        {
                        message: '',
                        code: 'HIS-1039',
                        attribute: {}
                        }
                    ]
                }
            }
        };
        const expectedErrorObject = {
            message: "You have exceeded the maximum limit of failed attempts. Please try again in 12 hours",
            status: 429,
            code: "HIS-1039"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for maximum failed otp attempts and block for 30 mins', () => {
        const err = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                        {
                        message: 'Please wait for 30 minutes to try again with same ABHA number',
                        code: 'HIS-1023',
                        attribute: {}
                        }
                    ]
                }
            }
        };
        const expectedErrorObject = {
            message: "Please wait for 30 minutes to try again with same ABHA number",
            status: 422,
            code: "HIS-1023"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });

    test('get appropriate error object for failed otp attempt', () => {
        const err = {
            status: 422,
            response: {
                data: {
                    code: 'HIS-400',
                    message: 'Request is invalid. Please enter the correct data.',
                    details: [
                        {
                        message: 'Invalid transaction',
                        code: 'HIS-1013',
                        attribute: {}
                        }
                    ]
                }
            }
        };
        const expectedErrorObject = {
            message: "Please enter correct OTP number",
            status: 401,
            code: "HIS-1013"
        }
        const actualErrorObject = utils.getErrorObject(err)
        expect(actualErrorObject).toEqual(expectedErrorObject)
    });
});