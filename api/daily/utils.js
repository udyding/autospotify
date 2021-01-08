const axios = require('axios');
const { MongoClient, Db } = require('mongodb');

const { getGenres } = require('../initial/utils');
const { nextFive } = require('../initial/utils');

async function main() {
    const uri =
      "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
  
    const client = new MongoClient(uri);
  
    try {
      await client.connect();
  
       await checkPlaylistSongs(client, '2ClPpXi48pLysp4UiQvltz', 50, 'BQBZmAmmMx25VzG4zsFWu7gWUqef6E6WhJKw0Ydz3FbPhAVSaovZwdB-wIEmq7XoSJQhq-If4wA9bpWmaqgszzNe3728bsinwkmeI4JecvM56WcqpyPHTUkTyIbj73G_2BOGOMxg5PJUme5YrOnhgJv41iPwsPZ_wytJ3Os0qahYjBEGZJ_KXSRZdvniq8sBk6bcN2ikimdIkgOuMtjGBKpx0Ui6Oe9ikw6odcWbRDBQNw')
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
}


// checks all playlists with tracking on
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
  
    for (j = 0; j < playlistIds.length; j++) {
        await checkPlaylistSongs(playlistIds[j], access_token)
    }

    return true;
}


// consumes a playlist id and if the date is over the limit, adds a new one to playlist
async function checkPlaylistSongs(client, playlistId, limit, access_token) {
    let cursor = await client.db("Playlists").collection("playlist").find({ playlist_id: playlistId});
    let info = cursor.toArray();
    let songs = info.songs; // get all songs first and their info, in an array
    //let limit = info.limit;

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
    return playlistId;
}


// consumes a song id and adds new song with all info into the database
async function findNewSongInfo(songId, access_token) {
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



