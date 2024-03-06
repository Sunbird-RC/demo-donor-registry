const HOST = process.env.HOST || 'localhost'
const PROTOCOL = process.env.PROTOCOL || 'http'
const PORT = process.env.PORT || 5001
const DOMAIN_URL = process.env.DOMAIN_URL || 'http://localhost:5001'

module.exports = {
    PROTOCOL, HOST, PORT, DOMAIN_URL
}
