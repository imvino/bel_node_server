require('dotenv').config()
const express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')

// (Enable All CORS Requests)
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 ,
    methods:['GET','POST','DELETE']
}
app.use(cors(corsOptions))

// create application/json parser
app.use(bodyParser.json())

// create application/x-www-form-urlencoded parser
app.use( bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) {
    res.send('Hello World')
})
// other routes
require('./routes')(app);

//set port
app.listen(4000)
