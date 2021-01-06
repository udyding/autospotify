const axios = require('axios');
const { access } = require('fs');
const moment = require('moment');
const schedule = require('node-schedule');
const { get } = require('request');
const { MongoClient, Db } = require('mongodb');

let dateFormat = "YYYY-M-D"
const uri = "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
const client = new MongoClient(uri);

function main(playlist, limit) { // have to connect this with all playlists all at midnight
    checkSongs(playlist, limit); // init check
    let dailyCheck = schedule.scheduleJob({hour: 00, minute: 00}, function() {
        checkSongs(playlist, limit);
    });
}

/* $('a').click(function() { REPLACE THIS WITH THE INPUT FROM FRONT END TO STOP TRACKING
    clearInterval(i);
    turnOff(playlist, userRequest); INPUT FROM FRONT END SHOULD COME WITH USER REQUEST
}) */

// creates the initial playlist with all the song info
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
        console.log(songs);
    } catch(err) {
        console.log(err.response);
    }
}


// checks songs routinely for dates since added
async function checkPlaylistSongs(playlistId, limit, access_token) {
    let cursor = await client.db("Playlists").collection("playlist").find({ playlist_id: playlistId});
    let songs = cursor.toArray().songs; // get all songs first and their info, in an array
    let songsIds = [];
    for (k = 0; k < songs.length; k++) {
        songsIds.push(songs[i].song_id);
    }

    for (i = 0; i < songs.length; i++) {
        existingSongs.push(songs[i].song_id); // keeps track of songs
        let dateAdded = songs[i].date_added;
        let diffInDays = moment().diff(moment(dateAdded, dateFormat), 'days');
        if (diffInDays > limit) {
            songs[i].is_archived = true;
            let top_five = songs[i].top_five;

            let foundSong = top_five.find(element => songsIds.includes(element)); // should prob account for if its not in the playlist

            let foundSongInfo = findNewSongInfo(foundSong, access_token);
            const result = await client.db("Playlists").collection("playlist").insertOne(foundSongInfo);
            console.log(foundSongInfo);
            try { // posts the recommended song to the playlist
                const response = await axios({
                    method: "post",
                    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=spotify%3Atrack%3A${foundSongInfo.id}`,
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }});    
            } catch (err) {
                console.log(err.response);
            }
        }
    }
}

// adds a new recommended song to the playlist
async function findNewSongInfo(song_id, access_token) {
    try {
        const response = await axios({
            method: "get",
            url: `https://api.spotify.com/v1/tracks/${song_id}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }});
        let songInfo = response.data;
        let artistsItems = songInfo.artists; 
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

        let seedTrack = song_id;
        let seedArtists = artistsId;
        let firstArtistString = artistsId[0].toString();
        let topFive = await nextFive(seedTrack, firstGenresString, firstArtistString, access_token);

        let song = {
            date_added: (items[i].added_at.split("T"))[0],
            song_id: seedTrack, // this is also the seed_tracks
            seed_artists: seedArtists, // all seeds are in string form
            seed_genres: seedGenres, // this causes the program to run slower
            is_original: false, // this is false compared to an original song
            is_archived: false,
            top_five: topFive
        }; // similar to the addSongsFirst function

        const result = await client.db("Playlists").collection("playlist").insertOne(song);
        return song;
    } catch (err) {
        console.log(err.response);
    }
}



// get the genres of an array of artists for seed_artists
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


// get the first 5 recommended songs based on seeds
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

// when playlist is no longer tracked 
function turnOff(playlistId, userRequest) {
    // simply turns off the tracking on the playlist
    const result = client.db("Playlists").collection("playlist").updateOne(
        { playlist_id: playlistId },
        { $set: { "on_off": false }});
}



module.exports = {
    addSongsFirst,
    getGenres,
    nextFive,
    getplaylist,
}
