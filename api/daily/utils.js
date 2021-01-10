const axios = require('axios');
let client = require('../db')

// const { getGenres } = require('../turnOn/utils');
// const { nextFive } = require('../turnOn/utils');


// checks all playlists with tracking on
async function playlistsOn() {    
    try {
        // playlistIdArray = client
        //     .db("Playlists")
        //     .collection("playlist")
        //     .find(
        //         { on_off: true },
        //         {
        //         fields: {
        //             _id: 0,
        //             playlist_id: 1,
        //         },
        //         }
        //     )
        //     .toArray();
        // let playlistIds = [];
        // for (i = 0; i < playlistIdArray.length; i++) {
        //     playlistIds.push(playlistIdArray[i].playlist_id);
        //     }
        
        // for (j = 0; j < playlistIds.length; j++) {
        //     await checkPlaylistSongs(playlistIds[j], access_token)
        // }
        checkPlaylistSongs(client, '4xqSJMbBAhBYPavevLb0im', 50, 'BQDaZneykBjuWJ0ZdtuuceQi-nzcx4bTiwmWyQdKKWbxPdr73esuZS4bTDM6B-p-A7pjotv2aAGHzA7qSQL6vkBriDONhzbCilkQ0jaC0oGz6SOjp9Bt2TNeYYTsF_lDDF5bh_4zb9O_pEIB6n1RqM7eNEuc_ORg5QOs5O-fQsZbyfCsGWU98AJ6USGP2ERp9dnkHZI322eWTEGA42CYs5-m2MIvIpegwPRHz8fXm6QPhg')
    } catch (e) {
        console.error(e);
    }
    return true;
}


// consumes a playlist id and if the date is over the limit, adds a new one to playlist
async function checkPlaylistSongs(playlistId, access_token) {
    let cursor = await client.db("Playlists").collection("playlist").find({ playlist_id: playlistId});
    let info = cursor.toArray();
    let songs = info.songs; // get all songs first and their info, in an array
    let limit = info.limit;

    let songsIds = [];
    for (k = 0; k < songs.length; k++) {
        songsIds.push(songs[i].songId);
    }

    for (i = 0; i < songs.length; i++) {
        existingSongs.push(songs[i].songId); // keeps track of songs
        let dateAdded = songs[i].date_added;
        let diffInDays = moment().diff(moment(dateAdded, dateFormat), 'days');
        if (diffInDays > limit) {
            songs[i].is_archived = true;
            let top_five = songs[i].top_five;

            let foundSong = top_five.find(element => songsIds.includes(element)); // should prob account for if its not in the playlist

            let foundSongInfo = await findNewSongInfo(foundSong, access_token);
            const result = await client.db("Playlists").collection("playlist").insertOne(foundSongInfo);
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
    return playlistId;
}


// consumes a song id and adds new song with all info into the database
async function findNewSongInfo(givenClient, songId, access_token) {
    try {
        const response = await axios({
            method: "get",
            url: `https://api.spotify.com/v1/tracks/${songId}`,
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

        let seedTrack = songId;
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

module.exports = {
    playlistsOn, 
    checkPlaylistSongs,
}
