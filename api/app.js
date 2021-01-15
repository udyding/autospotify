const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE_URI } = require('./config');

let app = express();
const PORT = 8888;

let client = require('./db');

const auth = require('./authorization/routes');
const daily = require('./daily/routes');
const initial = require('./initial/routes');
const turnOn = require('./turnOn/routes');
const turnOff = require('./turnOff/routes');

const router = express.Router();
// third party middleware
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.status(200).send('Connected to app.');
})

app.use('/auth', auth)
app.use('/initial', initial)
app.use('/turnOn', turnOn)
app.use('/daily', daily)
//app.use('/turnOff', turnOff)

// connect to the database
client.connect(DATABASE_URI, (err) => {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
        app.listen(PORT, () => {
            console.log('Listening on http://localhost:' + PORT);
        });
    }
});
