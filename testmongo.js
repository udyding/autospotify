const {MongoClient} = require('mongodb');
const { callbackify } = require('util');

async function main(){

    const uri = "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
 

    const client = new MongoClient(uri);

    //const newplaylists = getplaylists(user_id, access_token)
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        await findOne(client);
        // Make the appropriate DB calls



 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function findOne(client) {
    const cursor = client.db("Playlists").collection("playlist").find({ playlist_id: 789});
    const result = await cursor.toArray();
    console.log(result)
}
main();