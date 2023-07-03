const HOST = process.env.HOST || 'localhost'
const PROTOCOL = process.env.PROTOCOL || 'http'
const PORT = process.env.PORT || 5001

module.exports = {
    PROTOCOL, HOST, PORT
}