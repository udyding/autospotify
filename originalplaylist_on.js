const {MongoClient} = require('mongodb');
const axios = require('axios');
const { addSongsFirst } = require('./functions');
const { application } = require('express');

async function main(){

    const uri = "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

    const client = new MongoClient(uri);

    let playlist_id = "0byMhWqEoUp34QEScJCwBm"
      try {
          // Connect to the MongoDB cluster
          await client.connect();
   
          // Make the appropriate DB calls
          //await createduplicateplaylist(client, smth)

          await updatesongs(client, playlist_id, "BQBxmDrIr-Yw21MzYr167GpDBE7IvoLuN4DDAtoI3ZHPAwG0lsd4VfPHaQ7aTgMTSQHPnfvtvC1F9Uy004dKxfPvzVL0pbB1weVkJmVtB8pM2tMLaRTfj-brpQK3ld4qZ5ksUIpXDOk5Mum0PcrMY7BDm1OIU-2m1TtjgI8j4y4YYvnwYncmGq-74D4mqm6TnCnTG0GhjAcUyOm_4CrL71IWCph4HMWdrg");
          await returnoriginaltracks(client, playlist_id, "BQBxmDrIr-Yw21MzYr167GpDBE7IvoLuN4DDAtoI3ZHPAwG0lsd4VfPHaQ7aTgMTSQHPnfvtvC1F9Uy004dKxfPvzVL0pbB1weVkJmVtB8pM2tMLaRTfj-brpQK3ld4qZ5ksUIpXDOk5Mum0PcrMY7BDm1OIU-2m1TtjgI8j4y4YYvnwYncmGq-74D4mqm6TnCnTG0GhjAcUyOm_4CrL71IWCph4HMWdrg") 
  
   
      } catch (e) {
          console.error(e);
      } finally {
          await client.close();
      }
  }
  
  main().catch(console.error);

  
  async function updatesongs(client, playlistval, access_token) {
    let addedsongs = await addSongsFirst(playlistval, access_token)
    result = await client.db("Playlists").collection("playlist")
                        .updateMany({ playlist_id: playlistval }, { $set: { 
                            songs: addedsongs, 
                            on_off: true }});

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`); 
}

async function returnoriginaltracks(client, playlist_id, access_token) {
    let trackuris = geturis(playlist_id, access_token)

  result = await client.db("Playlists").collection("originals").insertOne(
      {playlist_id: playlist_id, tracks: trackuris}
  )
}
           
//get uris of all songs in the original playlist
async function geturis(playlist_id, access_token) {
    try {
        const response = await axios({
            method: "get" ,
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        let info = response.data.items
        for (let i = 0; i < info.length;i++) {
            let uris = info[i].track.uri
            console.log(uris)
        }        
        
    } catch (err) {
        console.log(err.response)
    }
};


