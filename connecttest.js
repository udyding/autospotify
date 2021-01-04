const {MongoClient} = require('mongodb');

async function main(){

    const uri = "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
 

    const client = new MongoClient(uri);

    //const newplaylists = getplaylists(user_id, access_token)
    let allplaylists = getplaylist("fion_the_lion","BQCQm0Bweo0TC7oIGDSXuHSprNt904Hb9jteMIQqfSt04VLuZmfbe8GBwKSonAWc_dszZMKBCY5sqjeXz4OjW_czQXZZmkqnXb4F3wJgXYEp71bDTQO-6Kf67tZ9rRHZwjXW80Wyk4v660pjZH-yklwx3MkeCN6MAiY8w1M") 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        await createMultiplePlaylists(client, allplaylists)
         //   getplaylist("fion_the_lion","BQCQm0Bweo0TC7oIGDSXuHSprNt904Hb9jteMIQqfSt04VLuZmfbe8GBwKSonAWc_dszZMKBCY5sqjeXz4OjW_czQXZZmkqnXb4F3wJgXYEp71bDTQO-6Kf67tZ9rRHZwjXW80Wyk4v660pjZH-yklwx3MkeCN6MAiY8w1M")
        //     );
        // let allplaylists = await getplaylist("fion_the_lion","BQCQm0Bweo0TC7oIGDSXuHSprNt904Hb9jteMIQqfSt04VLuZmfbe8GBwKSonAWc_dszZMKBCY5sqjeXz4OjW_czQXZZmkqnXb4F3wJgXYEp71bDTQO-6Kf67tZ9rRHZwjXW80Wyk4v660pjZH-yklwx3MkeCN6MAiY8w1M") 
        // await createMultiplePlaylists(client, 
        // await createMultiplePlaylists(client, 
        //     [{playlist_id: 34, user_id: "hello"},
        //     {playlist_id: 4, user_id: "hi"}
        // ]);

 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//main().catch(console.error);

//lists all the collections in the Playlist database (testing purposes)
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

//finds playlist by playlist id (can be used for deletion later)
//can also be modified to search for time limits
async function findplaylistbyid(client, playlist_id) {
    result = await client.db("Playlists").collection("playlist")
                        .findOne({ playlist_id: playlist_id });

    if (result) {
        console.log(`Found a playlist with the id '${playlist_id}':`);
        console.log(result);
    } else {
        console.log(`No playlists found with the id '${playlist_id}'`);
    }
}


//create a single new playlist
async function createPlaylist(client, newplaylist){
    const result = await client.db("Playlists").collection("playlist").insertOne(newplaylist);
    console.log(`New playlist created with the following id: ${result.insertedId}`);
}

//deletes playlists (for on/off later on)
async function deleteplaylistbyid(client, playlist_id) {
    result = await client.db("Playlists").collection("playlist")
            .deleteOne({ playlist_id: 123 });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function getplaylist(user_id, access_token) {
    try {
        const response = await axios({
            method: "get" ,
            url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        let info = response.data.items
        let playlists = []
        for (let i = 0; i < info.length;i++) {
            let playlist = {
                playlist_id: info[i].id,
                user_id: user_id
            }
            playlists.push(playlist)
        }
        return playlists
        
    } catch (err) {
        console.log(err.response)
    }
};

//creates multiple playlists
async function createMultiplePlaylists(client, newplaylists){
    const result = await client.db("Playlists").collection("playlist").insertMany(newplaylists);

    // console.log(`${result.insertedCount} new playlist(s) created with the following id(s):`);
    //console.log(result);


};


//the getplaylists function will produce an array of (playlist_id, user_id) given a user_id

//connecttodb function will automatically a document to the database, with playlist_id, user_id,limit(null), songs(null)

main().catch(console.error);