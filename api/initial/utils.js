const axios = require("axios");
const { MongoClient } = require("mongodb");


// gets all the playlists of the user and stores it into the database
// runs only if the user has logged in for the very first time
async function createMultiplePlaylists(userId, access_token) {
  
  const uri =
    "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    result = await client
    .db("Playlists")
    .collection("Users")
    .find({ user_id: userId })
    .toArray();

    if (result.length === 0) {
      let allPlaylists = await getPlaylist(userId, access_token);
      const result = await client
        .db("Playlists")
        .collection("playlist")
        .insertMany(allPlaylists);
    } 
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function getPlaylist(user_id, access_token) {
  try {
    const response = await axios({
      method: "get",
      url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    let info = response.data.items;
    let playlists = [];
    for (let i = 0; i < info.length; i++) {
      let playlist = {
        playlist_id: info[i].id,
        user_id: user_id,
      };
      playlists.push(playlist);
    }

    return playlists;
  } catch (err) {
    console.log(err.response);
  }
}


module.exports = {
  getPlaylist,
  createMultiplePlaylists,
}