const express = require('express');
const router = express.Router();

const { playlistsOn, checkPlaylistSongs } = require('./utils');


router.get('/getOnPlaylists', async (req, res) => {
    try {
        const { playlistId, access_token } = req.query;
        await checkPlaylistSongs(playlistId, access_token);
        res.status(200).send('successfully checked!');
    } catch (err) {
        res.status(400).send(err);
    }
});


module.exports = router;