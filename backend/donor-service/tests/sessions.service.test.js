describe('should retrieve client secret and cache it', () => {

    const redis = require('../services/redis.service')
    const config = require('../configs/config')
    const axios = require('axios').default
    const sessionsService = require('../services/sessions.service');

    jest.mock('../configs/config', () => {
        return {
            ABHA_CLIENT_URL: 'http://abha-client-url',
            CLIENT_ID: 'client_id',
            CLIENT_SECRET: 'client_secret'
        }
    });
    jest.mock('../services/redis.service', () => {
        return {
            storeKeyWithExpiry: jest.fn(),
            getKey: jest.fn()
        }
    })
    jest.mock('axios')

    test('should return client secret from redis', async() => {
        const expectedClientSecret = 'token';
        jest.spyOn(redis, 'getKey').mockReturnValue(Promise.resolve(expectedClientSecret))
        
        const actualClientSecret = await sessionsService.getClientSecretToken();

        expect(actualClientSecret).toEqual(expectedClientSecret);
    });

    test('should return client secret from abha apis', async() => {
        const expectedClientSecret = 'token';
        const tokenResponse = {
            data: {
                accessToken: expectedClientSecret,
                expiresIn: '600'
            }
        }
        jest.spyOn(redis, 'getKey').mockReturnValue(Promise.resolve(null))
        jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve(tokenResponse));
        
        const actualClientSecret = await sessionsService.getClientSecretToken();

        expect(actualClientSecret).toEqual(expectedClientSecret);
        expect(axios.post).toHaveBeenCalledWith('http://abha-client-url', {
            clientId: 'client_id',
            clientSecret: 'client_secret'
        });
        expect(redis.storeKeyWithExpiry).toHaveBeenCalledWith('clientSecret', 'token', 600)
    });
})