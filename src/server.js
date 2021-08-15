require('dotenv').config();
// import libraries
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// make server read json data;
app.use(express.json());

// make server parse cookies;
app.use(cookieParser(process.env.COOKIE_SECRET));

// set up cors for the server
const setCors = require('./utility/setCors');
const nodeEnv = process.env.NODE_ENV;

// set up morgan for dev logs
app.use(morgan('dev'));

app.use(cors({
    // origin: 'https://dodoodle.netlify.app',
    // origin: 'http://locahost:3000',
    origin: 'http://localhost:3000',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}));

//import different routes
const authRouter = require('./routes/auth');
const adminAuthRouter = require('./routes/adminAuth');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const locationRouter = require('./routes/location');
const hospitalRouter = require('./routes/hospital');
const employeeRouter = require('./routes/employee');
const staffRouter = require('./routes/staff');
const patientRouter = require('./routes/patient');

// set up different api routes


// user auth routes
app.use('/api/auth', authRouter);

//admin auth routes
app.use('/api/auth/admin', adminAuthRouter);

// admin routes
app.use('/api/admin', adminRouter);

// user routes
app.use('/api/user', userRouter);

// hospital routes
app.use('/api/hospital', hospitalRouter);

// hospital employee routes
app.use('/api/hospital/employee', employeeRouter);

// hospital staff routes
app.use('/api/hospital/staff', staffRouter);

// hospital patient routes
app.use('/api/hospital/patient', patientRouter);

//location
app.use('/api/location', locationRouter);



// start the server on port 5000 in development 
// else start on env defined port
const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI_LOCAL;
// console.log(MONGO_URI);
mongoose.connect(`${MONGO_URI}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
})
    .then(() => {
        app.listen(port, () => {
            console.log("database connected");
            console.log(`Server started at port ${port}`);
        });
    });
