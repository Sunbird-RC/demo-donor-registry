const redis = require("../services/redis.service");
const {isABHARegistered, getAndCacheEKYCProfile, getKeyBasedOnEntityName} = require("../services/abhaProfile.service");
const config = require("../configs/config");
const axios = require('axios').default

describe('get and cache kyc profile', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

    });
    test('should cache the abha profile', async() => {
        const expectedProfile = {
            healthIdNumber: '919191919191',
            name: 'Dummy dummy'
        }
        const mockAbhaProfile = {
            data: expectedProfile
        }
        jest.replaceProperty(config, 'BASE_URL', 'http://localhost:4000')
        jest.replaceProperty(config, 'EXPIRE_PROFILE', 100)
        jest.spyOn(axios, 'get').mockReturnValue(mockAbhaProfile)
        jest.spyOn(redis, 'storeKeyWithExpiry').mockReturnValue(true)
        const actualProfile = await getAndCacheEKYCProfile('clientSecret', 'userToken');
        expect(axios.get).toHaveBeenCalledWith('http://localhost:4000/v1/account/profile', {
            headers: {
                Authorization: 'Bearer clientSecret',
                'X-Token': 'Bearer userToken'
            }
        });
        expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith('919191919191', "{\"healthIdNumber\":\"919191919191\",\"name\":\"Dummy dummy\"}", 100)
        expect(actualProfile).toEqual(expectedProfile);
    });

    test('should check if abha is registered if force is enabled', async () => {
        jest.spyOn(redis, 'getKey').mockReturnValue(true)
        const isRegistered = await isABHARegistered("a12341234", true);
        expect(redis.getKey).toBeCalledWith("Da12341234")
        expect(isRegistered).toBeTruthy()
    })

    test('should not check the cache if force is disabled', async () => {
        jest.spyOn(redis, 'getKey').mockReturnValue(true)
        const isRegistered = await isABHARegistered("a12341234", false);
        expect(redis.getKey).toBeCalledTimes(0)
        expect(isRegistered).toBeFalsy()
    })

    test('should check if abha is registered if UNIQUE_ABHA_ENABLED config is enabled', async () => {
        jest.replaceProperty(config, 'UNIQUE_ABHA_ENABLED', true)
        jest.spyOn(redis, 'getKey').mockReturnValue(true)
        const isRegistered = await isABHARegistered("a12341234", false);
        expect(redis.getKey).toBeCalledWith("Da12341234")
        expect(isRegistered).toBeTruthy()
    })


    test('should return matching key based on entity name', async () => {
        const keyBasedOnEntityName = getKeyBasedOnEntityName("Pledge");
        expect(keyBasedOnEntityName).toBe("D")
    })

    test('should return null for invalid entity name', async () => {
        const keyBasedOnEntityName = getKeyBasedOnEntityName("ABC");
        expect(keyBasedOnEntityName).toBeNull()
    })
})
