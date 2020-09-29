module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'developemnt',
    DB_URL: process.env.DB_URL || 'postgresql://rachel:1234@localhost/noteful'
}