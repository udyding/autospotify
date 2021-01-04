const {MongoClient} = require('mongodb');

async function main(){

    const uri = "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
 

    const client = new MongoClient(uri);

    //const newplaylists = getplaylists(user_id, access_token)
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        // await createMultiplePlaylists(client, 
        //     getplaylist("fion_the_lion","BQA2PUOFjunRpjb9FfsanuKlSza0--vE3DZHkvWOD9aa6krxSlIGuqxpjUNHB2hCyw4NVnwNDczCKCB0ercKrBYm5Ig4CYxxNpuryvquB9zDsLioxKoYDlqxBClcIYsMLYh6q6iTZK4k1rPaiWWmID1bzI2mY61FflBEgtM")
        //     );
        let allplaylists = await getplaylist("fion_the_lion","BQA2PUOFjunRpjb9FfsanuKlSza0--vE3DZHkvWOD9aa6krxSlIGuqxpjUNHB2hCyw4NVnwNDczCKCB0ercKrBYm5Ig4CYxxNpuryvquB9zDsLioxKoYDlqxBClcIYsMLYh6q6iTZK4k1rPaiWWmID1bzI2mY61FflBEgtM") 
        await createMultiplePlaylists(client, allplaylists)
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

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