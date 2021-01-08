require("dotenv").config();
const express = require("express");
const router = express.Router();

const { getTokens, findId } = require(".utils");

const scope =
  "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative";

const frontendURL = "http://localhost:8080";
const backendURL = "http://localhost:8888";
const loggedInURL = `${backendURL}/auth/loggedin`;
const authenticatedURL = `${frontendURL}/redirectAfterLogin`;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.HOST;

router.get("/login", (req, res) => {
  let authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}`;
  authURL += `&scope=${encodeURIComponent(scope)}`;
  authURL += `&redirect_uri=${encodeURIComponent(loggedInURL)}`;

  res.redirect(authURL);
});

router.get("/loggedin", async (req, res) => {
  try {
    const { code: authCode, error } = req.query;

    if (error) {
      res.redirect(frontendURL);
      return;
    }

    const accessToken = await getTokens(authCode);
    const userID = await findId(accessToken);

    res.redirect(`${authenticatedURL}/${userID}`);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
