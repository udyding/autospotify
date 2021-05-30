const axios = require('axios');
const moment = require('moment');
let client = require('../db');

const { getGenres, next5 } = require('../turnOn/utils');


// checks all playlists with tracking on
async function playlistsOn(access_token) {    
    try {
        // first get a list of all playlist ids that have tracking turned on
        let playlistIdArray = await client
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
        
        // go thru each and check all songs for passing the limit
        for (j = 0; j < playlistIds.length; j++) {
            await checkPlaylistSongs(playlistIds[j], access_token)
        }
    } catch (e) {
        console.error(e);
    }
}


// consumes a playlist id and if the date is over the limit, adds a new one to playlist
async function checkPlaylistSongs(playlistId, access_token) {
    let info = (await client.db("Playlists").collection("playlist").find({ playlist_id: playlistId}).toArray())[0];
    let songs = info.songs; // get all songs first and their info, in an array
    let limit = parseInt(info.limit);
    let songsIds = [];

    // gets all song ids of all songs in the playlist
    for (k = 0; k < songs.length; k++) {
        songsIds.push(songs[k].song_id);
    }
    let songsToDelete = [];
    let songsToAdd = [];
    let addSongsIds = [];

    for (let i = 0; i < songs.length; i++) {
        let dateAdded = songs[i].date_added;
        let diffInDays = moment().diff(dateAdded, 'days');
        if (diffInDays > limit) {
            await client.db("Playlists").collection("playlist").updateOne(
                { playlist_id: playlistId, "songs.song_id": songsIds[i] }, 
                { $set: { "songs.$.is_archived": true } } ); 

            let top_five = songs[i].top_five;

            // finds song id of song that is not in the current playlist
            let foundSong = top_five.find(element => !songsIds.includes(element)); 
            songsIds.push(foundSong);
            addSongsIds.push(foundSong);
            
            let songUri = "spotify:track:" + songsIds[i];
            songsToDelete.push({ uri: songUri });
            songsToAdd.push(songUri);
        }
    }

    let foundSongsStr = encodeURIComponent(addSongsIds.join())
    let foundSongsInfo = await findNewSongInfo(foundSongsStr, access_token);

    // adds songs to the database
    await client.db("Playlists").collection("playlist").updateOne(
        { playlist_id: playlistId}, { $push: { songs: { $each: foundSongsInfo} } });

    let m, n, tempArray;
    let chunk = 100;
    for (m = 0, n = songsToAdd.length; m < n; m += chunk) {
        tempArray = songsToAdd.slice(m, m + chunk);
        // adds the first 100 songs to song to the playlist in spotify (100 is the limit)
        try { 
            const response = await axios({
                method: "post",
                url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=spotify%3Atrack%3A${foundSong}`,
                data: {
                    uris: tempArray
                },
                headers: {
                    Authorization: `Bearer ${access_token}`
                }});    
        } catch (err) {
            console.log(err.response);
        }
    }
    
    let p, q, tempArray2;
    for (p = 0, q = songsToDelete.length; p < q; p += chunk) {
        tempArray2 = songsToDelete.slice(p, p + chunk);
        // finally delete old songs from the playlist (max 100 as well)
        try {
            const response = await axios({
                method: "DELETE",
                url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                data: {
                    tracks: tempArray2
                },
                headers: {
                    Authorization: `Bearer ${access_token}`
                }});    
        } catch (err) {
            console.log(err.response);
        }
    }
    return playlistId;
}




// consumes an string of song ids and adds new songs with all info into the database
async function findNewSongInfo(songIds, access_token) {
    try {
        // get the song info first
        const response = await axios({
            method: "get",
            url: `https://api.spotify.com/v1/tracks?ids=${songIds}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }});
        let songsInfo = response.data.tracks;
        let songs = [];

        for (i = 0; i < songsInfo.length; i++) {
            let artistsItems = songsInfo[i].artists; 
            console.log(songsInfo[i].artists)
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
            let seedTrack = songInfo[i].id;
            let seedArtists = artistsId;
            let firstArtistString = artistsId[0].toString();
            let top15 = await next5(seedTrack, firstGenresString, firstArtistString, access_token);
            let song = {
                date_added: (moment().format().split("T"))[0],
                song_id: seedTrack, // this is also the seed_tracks
                seed_artists: seedArtists, // all seeds are in string form
                seed_genres: seedGenres, // this causes the program to run slower
                is_original: false, // this is false compared to an original song
                is_archived: false,
                top_fifteen: top5
            }; 
            // similar to the addSongsFirst function
            songs.push(song)
        }
        return songs;
    } catch (err) {
        console.log(err.response);
    }
}

module.exports = {
    playlistsOn, 
    checkPlaylistSongs,
}
