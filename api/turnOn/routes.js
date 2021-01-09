const express = require('express')
const {updateSongs, 
        createNewPlaylist, 
        returnOriginalTracks,
        getUris,
        nextFive,
        addSongsFirst,
        getGenres,} = require('./utils')


const router = express.Router()

router.get('/updateSongs', async (req, res) => {
    try {
      const { playlistID, access_token } = req.query
      const updatedSongs = await updateSongs(playlistID, access_token)

      res.status(200).send(updateSongs)
      
    } catch (err) {
      res.status(400).send(err)
    }
  })

  router.get('/createNewPlaylist', async (req, res) => {
    try {
        const { userID, access_token } = req.query
        const createdNewPlaylist = await createNewPlaylist(userID, access_token)
  
        res.status(200).send(createdNewPlaylist)
        
      } catch (err) {
        res.status(400).send(err)
      }
    })

  router.get('/returnOriginalTracks', async (req, res) => {
    try {
        const { playlistID, access_token } = req.query
        const returnTracks = await returnOriginalTracks(playlistID, access_token)
  
        res.status(200).send(returnTracks)
        
      } catch (err) {
        res.status(400).send(err)
      }
    })

  router.get('/getUris', async (req, res) => {
    try {
        const { playlistID, access_token } = req.query
        const gotUris = await getUris(playlistID, access_token)
  
        res.status(200).send(gotUris)
        
      } catch (err) {
        res.status(400).send(err)
      }
    })

router.get('/nextFive', async (req, res) => {
    try {
        const { seedTracks, seedGenres, seedArtists, access_token } = req.query
        const nextFiveSongs = await nextFive(seedTracks, seedGenres, seedArtists, access_token)
    
        res.status(200).send(nextFiveSongs)
        
        } catch (err) {
        res.status(400).send(err)
        }
    })

router.get('/addSongsFirst', async (req, res) => {
    try {
        const { playlistID, access_token } = req.query
        const firstaddedsongs = await addSongsFirst(playlistID, access_token)
    
        res.status(200).send(firstaddedsongs)
        
        } catch (err) {
        res.status(400).send(err)
        }
    })

router.get('/getGenres', async (req, res) => {
    try {
        const { seed_artists, access_token } = req.query
        const gotGenres = await getGenres(seed_artists, access_token)
    
        res.status(200).send(gotGenres)
        
        } catch (err) {
        res.status(400).send(err)
        }
    })

        
  module.exports = router