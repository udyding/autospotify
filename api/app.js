const express = require('express');
const bodyParser = require('body-parser')
const { MongoClient } = require("mongodb")

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

MongoClient.connect("mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true",
{useNewUrlParser: true})
.then(client => {
const db = client.db('Playlist');
const collection = db.collection('playlists');
app.locals.collection = collection;
app.listen(port, () => console.info(`API running on port ${port}`));

}).catch (error => console.error(error));

//addSongsFirst
app.get('/addSongsFirst', (req, res) => {
    const firstaddedsongs = addSongsFirst(playlistID, access_token)
    res.status(200).send(firstaddedsongs)
});

//playlistsOn
app.get('/playlistsOn', (req, res) => {
    const onPlaylists = playlistsOn(access_token)
    res.status(200).send(onPlaylists)

//checkPlaylistSongs
app.get('/checkPlaylistSongs', (req, res) => {
    const checkPlaylists = checkPlaylistSongs(playlistId, access_token)
    res.status(200).send(checkPlaylists)

//findNewSongInfo
app.get('/findNewSongInfo', (req, res) => {
    const songInfo = findNewSongInfo(songID, access_token)
    res.status(200).send(songInfo)

//updateSongs
app.get('/updateSongs', (req, res) => {
    const updatedSongs = updateSongs(playlistID, access_token)
    res.status(200).send(updatedSongs)

//createMultiplePlaylists
app.get('/createMultiplePlaylists', (req, res) => {
    const MultiplePlaylists = createMultiplePlaylists()
    res.status(200).send(MultiplePlaylists)
}