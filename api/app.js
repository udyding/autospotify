const express = require('express');
const bodyParser = require('body-parser')

const app = express();
const PORT = process.env.PORT || 8888;

const auth = require('./authorization/routes');
//const daily = require('./daily/routes');
//const initial = require('./initial/routes');
const standby = require('./standby/routes');

const router = express.Router();
// third party middleware
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.status(200).send('Connected to app.')
})

//router.post()
app.use('/auth', auth)
app.use('/standby', standby)
// app.use('/initial', initial)
// app.use('/daily', daily)
// add in the turn off function


app.listen(PORT);
console.log('Listening on http://localhost:' + PORT)