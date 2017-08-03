module.exports = {
    development : {
        secret: process.env.APPBEE_SECRET_KEY,
        dbUrl: process.env.MONGO_URL,
        port: process.env.PORT || 8080,
        googleClientId: process.env.GG_CLIENT_ID
    },
    test : {
        secret: 'secretKey',
        dbUrl: process.env.MONGO_URL,
        port: 3000,
        googleClientId: '',
        testUserId : '109974316241227718963',
        appbeeToken : {
            valid   : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDk5NzQzMTYyNDEyMjc3MTg5NjMiLCJlbWFpbCI6ImFwcGJlZTA2MjdAZ21haWwuY29tIiwibmFtZSI6IkJlZSBBcHAiLCJwcm92aWRlciI6IkdHIiwiaWF0IjoxNTAxNTc0OTE3LCJleHAiOjQ2NTczMzQ5MTcsImlzcyI6ImFwcGJlZS5jb20iLCJzdWIiOiJBcHBCZWVBdXRoIn0.F09sUmkBtwvZei-RCt6eWUF17BhmHd30WlFhau7DTaQ",
            expired : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDk5NzQzMTYyNDEyMjc3MTg5NjMiLCJlbWFpbCI6ImFwcGJlZTA2MjdAZ21haWwuY29tIiwibmFtZSI6IkJlZSBBcHAiLCJwcm92aWRlciI6IkdHIiwiaWF0IjoxNTAxNTc1MDQwLCJleHAiOjE1MDE1NzUwNDEsImlzcyI6ImFwcGJlZS5jb20iLCJzdWIiOiJBcHBCZWVBdXRoIn0._i1rbf--jvNqPlfN_lRg4-oNEzreVDJYDq0DvtVDiZ4",
            invalid : "IamFake"
        }
    }
};