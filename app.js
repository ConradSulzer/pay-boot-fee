const path = require('path');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
require('dotenv').config();
require('./db/mongoose');
const session = require('express-session');
const MonDBStore = require('connect-mongodb-session')(session);

const PORT = process.env.PORT || '3000';

//Session setup=======================================
const store = new MonDBStore({
    uri: process.env.MONGODB_CONNECT,
    collection: 'sessions'
});

app.use(session({
    genid: function () {
        return uuidv4();
    },
    cookie: {
        maxAge: 60 * 1000 * 60 *24 //Expires after 24 hours
    },
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false,
    store: store
}));

//Middleware------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Setup static resource route and EJS------------------
const publicDirectoryPath = path.join(__dirname, '/public');
const viewsPath = publicDirectoryPath + '/views'
app.use(express.static(publicDirectoryPath));
app.set('view engine', 'ejs'); 
app.set('views', viewsPath);

//Routes setup-----------------------------------------
const paymentsRouter = require('./routes/payments-router');
const frontRouter = require('./routes/front-routes');
const bootRouter = require('./routes/boot-routes');
const agentRouter = require('./routes/agent-routes');
app.use(paymentsRouter);
app.use(frontRouter);
app.use(bootRouter);
app.use(agentRouter);

//Server port assignment--------------------------------
app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
});