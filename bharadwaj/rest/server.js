require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_helpers/error-handler');
const mongoose = require('mongoose');
const { mongoURI } = require('./config.json')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

mongoose.connect(mongoURI)
        .then(() => {
            console.log(`Succesfully Connected to theMongodb Database..`)
        })
        .catch(() => {
            console.log(`Error Connecting to the Mongodb Database...`)
        });

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});