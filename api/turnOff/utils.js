const { MongoClient } = require("mongodb");
const axios = require("axios");

async function turnOff(playlist_id) {
  const uri =
    "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    songsReturned = await client
      .db("Playlists")
      .collection("playlist")
      .find(
        { playlist_id: playlist_id },
        {
          fields: {
            _id: 0,
            songs: 1,
          },
        }
      )
      .toArray();

    let songsArrayArray = [];

    for (i = 0; i < songsReturned.length; i++) {
      songsArrayArray.push(songsReturned[i].songs);
    }

    const songsArray = songsArrayArray[0];

    await client
      .db("Playlists")
      .collection("playlist")
      .updateMany(
        { playlist_id: playlist_id },
        {
          $unset: {
            songs: 1,
          },
          $set: {
            on_off: false,
          },
        }
      );
    console.log("Songs has been taken out");

    console.log(songsArray);
    return songsArray;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

module.exports = {
  turnOff,
};
