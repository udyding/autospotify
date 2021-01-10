const express = require('express');
const bodyParser = require('body-parser')
const { DATABASE_URI } = require('./config')

const app = express();
const PORT = process.env.PORT || 8888;

let client = require('./db');

const auth = require('./authorization/routes');
const daily = require('./daily/routes');
const initial = require('./initial/routes');
const turnOn = require('./turnOn/routes');
const turnOff = require('./turnOff/routes')

const router = express.Router();
// third party middleware
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.status(200).send('Connected to app.')
})

app.use('/auth', auth)
app.use('/initial', initial)
app.use('/turnOn', turnOn)
app.use('/daily', daily)
app.use('/turnOff', turnOff)


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

// //addSongsFirst
// app.get('/addSongsFirst', (req, res) => {
//     const firstaddedsongs = addSongsFirst(playlistID, access_token)
//     res.status(200).send(firstaddedsongs)
// });

//playlistsOn
// app.get('/playlistsOn', (req, res) => {
//     const onPlaylists = playlistsOn(access_token)
//     res.status(200).send(onPlaylists)

// //checkPlaylistSongs
// app.get('/checkPlaylistSongs', (req, res) => {
//     const checkPlaylists = checkPlaylistSongs(playlistId, access_token)
//     res.status(200).send(checkPlaylists)

// //findNewSongInfo
// app.get('/findNewSongInfo', (req, res) => {
//     const songInfo = findNewSongInfo(songID, access_token)
//     res.status(200).send(songInfo)

// //updateSongs
// app.get('/updateSongs', (req, res) => {
//     const updatedSongs = updateSongs(playlistID, access_token)
//     res.status(200).send(updatedSongs)

// //createMultiplePlaylists
// app.get('/createMultiplePlaylists', (req, res) => {
//     const MultiplePlaylists = createMultiplePlaylists()
//     res.status(200).send(MultiplePlaylists)
//}