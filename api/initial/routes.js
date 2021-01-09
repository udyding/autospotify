const express = require("express");
const router = express.Router();

const { getPlaylist, createMultiplePlaylists } = require("./utils");

router.get("/createMultiplePlaylists", async (req, res) => {
  try {
    const { userId, access_token } = req.query;
    const playlists = await getPlaylist(userId, access_token);

    const multiplePlaylists = await createMultiplePlaylists(playlists) //WORK ON THIS);
    res.status(200).send(multiplePlaylists);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
