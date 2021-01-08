const {MongoClient} = require('mongodb');
const axios = require('axios')
const { getGenres } = require('./functions');
const { nextFive } = require('./functions');
const { addSongsFirst } = require('./functions');

let playlist_id = "2E0IzZ6x9oLvN0sBNbHUxd"
let access_token = "BQA0kiEFjsnpG7a81e4kKaRszbltx7yyhZ6tzsa4ekwq2-zfCLhhrpzDj4AbCtxnKboeZlvZTrnJJSzQCsEdB5YIdlMcdUdSBi0BeWTc3Qm24h58ZRNydh53zQbUTpUtgH-A_YMeNreylCkci64rAtJ-GWk4khsb_DAVsMgrLFYpwQAvaI-sPsaH1XgbNpQkIWA98JSS326sOVKiEaUTnTgufdhloE0Zsg"


async function main(){

    const uri = "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
    let duplicateid = createNewPlaylist(user_id, access_token)
    const client = new MongoClient(uri);

      try {
          // Connect to the MongoDB cluster
          await client.connect();
   
          // Make the appropriate DB calls
          await updateSongs(client, playlist_id, addedsongs);
          await returnOriginalTracks(client, playlist_id, access_token) 
  
   
      } catch (e) {
          console.error(e);
      } finally {
          await client.close();
      }
  }
  
  main().catch(console.error);

  
  async function updateSongs(client, playlistval) {
    const addedsongs = await addSongsFirst(playlist_id, access_token)
    result = await client.db("Playlists").collection("playlist")
                        .updateMany({ playlist_id: playlistval }, { $set: { 
                            on_off: true, 
                            songs: addedsongs }});

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`); 
}

//get uris of all songs in the original playlist
async function getUris(playlist_id, access_token) {
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
}

let alluris = getUris(playlist_id, access_token)

//creates a new playlist named duplicate and returns the playlist id
async function createNewPlaylist(user_id, access_token) {
    try {
        const response = await axios({
            method: "POST" ,
            url: ` https://api.spotify.com/v1/users/${user_id}/playlists`,
            data: {
                name: "duplicate"
            }, 
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-type": "application.json"
            }
        })
        let playlistid = response.data.id
        return playlistid  
        
    } catch (err) {
        console.log(err.response)
    }

}


async function returnOriginalTracks(playlistid, access_token) {
    try {
        const response = await axios({
            method: "POST" ,
            url: ` 	https://api.spotify.com/v1/playlists/${playlistid}/tracks`,
            uris: alluris,
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-type": "application.json"
            }
        })
        console.log(response) 
        
    } catch (err) {
        console.log(err.response)
    }

}

async function addSongsFirst(playlist_id, access_token) {
    try {
        const response = await axios({
            method: "get",
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?market=CA&fields=items(added_at%2Ctrack(name%2Cid%2Cartists(id)))`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        let allInfo = response.data;
        let items = allInfo.items;
        let songs = [];
        let numberOfSongs = items.length;
        for (let i = 0; i < numberOfSongs; i++) {
            item = items[i];
            let artistsItems = item.track.artists; 
            let artistsId = [];
            for (let j = 0; j < artistsItems.length; j++) {
                artistsId.push(artistsItems[j].id);
            }
            let seedGenres = await getGenres(artistsId, access_token);
            let firstGenresString = '';
            if (seedGenres.length == 0) {
                firstGenresString = 'none';
            } else {
                firstGenresString = seedGenres[0].toString();
            }

            let seedTrack = items[i].track.id;
            let seedArtists = artistsId;
            let firstArtistString = artistsId[0].toString();
            let topFive = await nextFive(seedTrack, firstGenresString, firstArtistString, access_token);

            let song = {
                date_added: (items[i].added_at.split("T"))[0],
                song_id: seedTrack, // this is also the seed_tracks
                seed_artists: seedArtists, // all seeds are in string form
                seed_genres: seedGenres, // this causes the program to run slower
                is_original: true,
                is_archived: false,
                top_five: topFive
            };
            songs.push(song);
        }
      
        return songs;

    } catch(err) {
        console.log(err.response);
    }
}

// get the first 5 recommended songs based on seeds
async function getGenres(seed_artists, access_token) {
    let numArtists = seed_artists.length;
    let allGenres = [];
    for (i = 0; i < numArtists; i++) {
        try {
            const response = await axios({
                method: "get", 
                url: `https://api.spotify.com/v1/artists/${seed_artists[i]}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            let artistResponse = response.data;
            let artistGenres = artistResponse.genres;
            for (j = 0; j < artistGenres.length; j++) {
                allGenres.push(artistGenres[j]);
            }
        } catch (err) {
            console.log(err.response);
        }
    }

    let uniqueGenres = allGenres.reduce(function(a,b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);
    let topGenres = uniqueGenres.slice(0,5);
    return topGenres;
}

async function nextFive(seedTracks, seedGenres, seedArtists, access_token) {
    if (seedGenres != 'none') {
        try {
            const response = await axios({
                method: "get",
                url: `https://api.spotify.com/v1/recommendations?limit=5&market=CA&seed_artists=${seedArtists}&seed_genres=${seedGenres}&seed_tracks=${seedTracks}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            let allInfo = response.data;
            let tracksOnly = allInfo.tracks;
            let numTracks = tracksOnly.length;
            let song_ids = [];
            for (let i = 0; i < numTracks; i++) {
                song_ids.push(tracksOnly[i].id);
            };
            return song_ids; // returns an array of all 5 song ids
        } catch (err) {
        console.log(err.response)
    }
    } else {
        try {
            const response = await axios({
                method: "get",
                url: `https://api.spotify.com/v1/recommendations?limit=5&market=CA&seed_artists=${seedArtists}&seed_tracks=${seedTracks}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            let allInfo = response.data;
            let tracksOnly = allInfo.tracks;
            let numTracks = tracksOnly.length;
            let song_ids = [];
            for (let i = 0; i < numTracks; i++) {
                song_ids.push(tracksOnly[i].id);
            };
            return song_ids; // returns an array of all 5 song ids
        } catch (err) {
        console.log(err.response)
    }   
};
}

async function updateSongs(client, playlistval) {
    const addedsongs = await addSongsFirst(playlist_id, access_token)
    result = await client.db("Playlists").collection("playlist")
                        .updateMany({ playlist_id: playlistval }, { $set: { 
                            on_off: true, 
                            songs: addedsongs
          
                            }});

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`); 
    console.log(addedsongs)
}

module.exports = {
    updateSongs,
    createNewPlaylist,
    returnOriginalTracks,
    getUris,
    addSongsFirst,
    getGenres,
    nextFive,
};