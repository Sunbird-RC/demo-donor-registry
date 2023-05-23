describe('get and cache kyc profile', () => {
    const axios = require('axios').default
    const config = require('../configs/config');
    const redis = require('../services/redis.service')
    const R = require('ramda');
    
    jest.mock('axios');
    jest.mock('../services/redis.service', () => {
        return {
            storeKeyWithExpiry: jest.fn()
        }
    });
    jest.mock('../configs/config', () => {
        return {
            BASE_URL: 'http://localhost:4000',
            EXPIRE_PROFILE: 100
        }
    })
    const abhaProfile = require('../services/abhaProfile.service');
    
    test('should cache the abha profile', async() => {
        const expectedProfile = {
            healthIdNumber: '919191919191',
            name: 'Dummy dummy'
        }
        const mockAbhaProfile = {
            data: expectedProfile
        }
        jest.spyOn(axios, 'get').mockReturnValue(mockAbhaProfile)
        jest.spyOn(redis, 'storeKeyWithExpiry')
        const actualProfile = await abhaProfile.getAndCacheEKYCProfile('clientSecret', 'userToken');
        expect(axios.get).toHaveBeenCalledWith('http://localhost:4000/v1/account/profile', {
            headers: {
                Authorization: 'Bearer clientSecret',
                'X-Token': 'Bearer userToken'
            }
        });
        expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith('919191919191', "{\"healthIdNumber\":\"919191919191\",\"name\":\"Dummy dummy\"}", 100)
        expect(actualProfile).toEqual(expectedProfile);
    });
})