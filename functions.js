const axios = require("axios");
const { access } = require("fs");
const moment = require("moment");
const schedule = require("node-schedule");
const { get } = require("request");

const { MongoClient } = require("mongodb");

async function main() {
  const uri =
    "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

  const client = new MongoClient(uri);

  try {
    await client.connect();
    await playlistsOn(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

async function playlistsOn(client) {
  playlistIdArray = await client
    .db("Playlists")
    .collection("playlist")
    .find(
      { on_off: true },
      {
        fields: {
          _id: 0,
          playlist_id: 1,
        },
      }
    )
    .toArray();

  let playlistIds = [];

  for (i = 0; i < playlistIdArray.length; i++) {
    playlistIds.push(playlistIdArray[i].playlist_id);
  }

  return playlistIds;
}
