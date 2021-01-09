const express = require("express");
const { turnOff } = require("./utils");

const router = express.Router();

router.get("/turnOff", async (req, res) => {
  try {
    const { playlistID } = req.query;
    const turnOff = await turnOff(playlistID);

    res.status(200).send(turnOff);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
