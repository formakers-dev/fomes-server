const config = {};

config.development = {
    secret: process.env.APPBEE_SECRET_KEY,
    dbUrl: process.env.MONGO_URL,
    port: process.env.PORT || 8080,
    googleClientId: process.env.GG_CLIENT_ID,
};

config.staging = config.development;
config.production = config.development;

config.test = {
    secret: 'secretKey',
    dbUrl: process.env.MONGO_URL,
    port: 3000,
    googleClientId: '',
    testUser: {
        userId: '109974316241227718963',
        email: 'appbee@appbee.com',
        registrationToken: 'test_user_registration_token',
        gender: 'male',
        birthday: 1989,
        lifeApps: ['fomes', 'appbee'],
        nickName: 'test_user_nickname',
        googleIdToken: 'test_user_google_id_token',
    },
    appbeeToken: {
        valid: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDk5NzQzMTYyNDEyMjc3MTg5NjMiLCJlbWFpbCI6ImFwcGJlZTA2MjdAZ21haWwuY29tIiwibmFtZSI6IkJlZSBBcHAiLCJwcm92aWRlciI6IkdHIiwiaWF0IjoxNTAxNTc0OTE3LCJleHAiOjQ2NTczMzQ5MTcsImlzcyI6ImFwcGJlZS5jb20iLCJzdWIiOiJBcHBCZWVBdXRoIn0.F09sUmkBtwvZei-RCt6eWUF17BhmHd30WlFhau7DTaQ",
        expired: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDk5NzQzMTYyNDEyMjc3MTg5NjMiLCJlbWFpbCI6ImFwcGJlZTA2MjdAZ21haWwuY29tIiwibmFtZSI6IkJlZSBBcHAiLCJwcm92aWRlciI6IkdHIiwiaWF0IjoxNTAxNTc1MDQwLCJleHAiOjE1MDE1NzUwNDEsImlzcyI6ImFwcGJlZS5jb20iLCJzdWIiOiJBcHBCZWVBdXRoIn0._i1rbf--jvNqPlfN_lRg4-oNEzreVDJYDq0DvtVDiZ4",
        invalid: "IamFake"
    },
    testAppbeeNumber: "appbeeNumber",
};

module.exports = config[process.env.NODE_ENV];