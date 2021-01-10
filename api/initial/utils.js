const axios = require("axios");
let client = require('../db')


// gets all the playlists of the user and stores it into the database
// runs only if the user has logged in for the very first time
async function createMultiplePlaylists(userId, access_token) {
  try {
      let allPlaylists = await getPlaylists(userId, access_token);
      const result = await client
        .db("Playlists")
        .collection("playlist")
        .insertMany(allPlaylists);
        return true; 
  } catch (e) {
    console.error(e);
  } 
}

async function getPlaylists(userId, access_token) {
  try {
    const response = await axios({
      method: "get",
      url: `https://api.spotify.com/v1/users/${userId}/playlists`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    let info = response.data.items;
    let playlists = [];
    for (let i = 0; i < info.length; i++) {
      let playlist = {
        playlist_id: info[i].id,
        user_id: userId,
        playlist_name: info[i].name
      };
      playlists.push(playlist);
    }

    return playlists;
  } catch (err) {
    console.log(err.response);
  }
}


module.exports = {
  getPlaylists,
  createMultiplePlaylists,
}