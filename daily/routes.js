const express = require('express');
const { access } = require('fs');
const { send } = require('process');
const { getToken } = require('../auth/utils')
const { getGenres, topFive } = require('../initial/utils');
const { playlistsOn, checkPlaylistSongs, findNewSongInfo } = require('./utils');

// get instance of router
const router = express.Router();

router.get('/getOnPlaylists'), async (req, res) => {
    try {
        const { access_token } = req.query;
        const onPlaylists = playlistsOn(access_token);
        res.status(200).send(onPLaylists);
    } catch (err) {
        res.status(400).send(err);
    }
}

router.get('/checkPlaylistSongs'), async (req, res) => {
    try {
        const { playlistId, access_token } = req.query;
        const checkPlaylists = await checkPlaylistSongs(playlistId, access_token);
        res.status(200).send(checkPlaylists);
    } catch (err) {
        res.status(400).send(err);
    }
}

// use query params for get
// use body for posts that have a lot of data that can't really be a query param
// post: everything has to be a body
router.get('/findNewSongInfo'), async (req, res) => {
    try {
        const { songId, access_token } = req.query;
        const songInfo = await findNewSongInfo(songId, access_token);
        res.status(200).send(songInfo);
    } catch (err) {
        res.status(400).send(err);
    }
}