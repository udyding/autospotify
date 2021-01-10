const express = require('express');
const router = express.Router();

const { setUpPlaylist } = require('./utils')


router.get('/setUpPlaylist', async (req, res) => {
    try {
        const { userId, playlistId, limit, access_token } = req.query
        await setUpPlaylist(userId, playlistId, limit, access_token)

        res.status(200).send('Successfully turned on playlist!')
          
        } catch (err) {
          res.status(400).send(err)
        }
    })
        
  module.exports = router