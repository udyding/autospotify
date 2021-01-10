const axios = require("axios");
const qs = require("qs");
let client = require('../db');

const { CLIENT_ID, CLIENT_SECRET, BACKEND_URL } = require('../config');
const { createMultiplePlaylists } = require("../initial/utils");
const redirectURL = `${BACKEND_URL}/auth/loggedin`;


// checks if the user has logged in before or not
async function checkUser(access_token) {
  try {
      const response = await axios({
        method: "get",
        url: `https://api.spotify.com/v1/me`,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      let userInfo = response.data;
      let user = (({ id, display_name, images, country }) => ({ id, display_name, images, country }))(userInfo);
      let result = await client
        .db("Playlists")
        .collection("Users")
        .find({ "user.id": user.id })
        .toArray();

      if (result === undefined || result.length === 0) {
        await client
          .db("Playlists")
          .collection("Users")
          .insertOne({ user });
        createMultiplePlaylists(user.id, access_token)
      }
      return user;
  } catch (err) {
    console.log(err.response);
  }

}

// returns the access and refresh tokens given an authCode
async function getTokens(authCode, redirect_uri) {
  try {
    const response = await axios({
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    data: qs.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: authCode,
      redirect_uri: redirectURL,
    }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
    return response.data;
  } catch (err) {
    console.log(err.response)
  }
}


module.exports = {
  checkUser, 
  getTokens,
};