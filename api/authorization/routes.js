const express = require("express");
const router = express.Router();
const { FRONTEND_URL, BACKEND_URL, CLIENT_ID, CLIENT_SECRET } = require('../config')

const { getTokens, checkUser } = require("./utils");

const scope =
  "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative";

const loggedInURL = `${BACKEND_URL}/auth/loggedin`;
const authenticatedURL = `${FRONTEND_URL}/redirectAfterLogin`;

// upon login redirects you into a logged in page
router.get("/login", (req, res) => {
  let authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}`;
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

    const tokenData = await getTokens(authCode);
    const { access_token: accessToken, refresh_token: refreshToken } = tokenData;
    const user = await checkUser(accessToken);
    res.status(200).send(user) // havent done front end yet
    //res.redirect(`${authenticatedURL}/${userId}`);
    
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
