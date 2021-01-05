const axios = require("axios");

const { MongoClient } = require("mongodb");

async function findId(access_token) {
  try {
    const response = await axios({
      method: "get",
      url: `https://api.spotify.com/v1/me`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data.id;
  } catch (err) {
    console.log(err.response);
  }
}

async function main() {
  const uri =
    "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

  const client = new MongoClient(uri);

  try {
    await client.connect();

    await addId(
      client,
      await findId(
        "BQDxaRbzsPCVNcUxv2LzS3k7zPBdRhtvQ1Uya-W7OND9wiuaWt8kT7fOisKGLINBCanCfDpxw6qJP9R2KkI1Xr4Pq65Tg0tCYsbTrfGXb11e2GLlJiBnwqVZFnBh-k9T_TJGKVKiNgpa0zHWmwj_ULgQCdnyr3ygOhLRzb4CxAEoJE8n-DNlHf77XlwB3uWS0iE-yekwj5HF7f6W2DyE7cUMyUhLmWRPIRe_vYMN3JcvL-xNr6Ryg8EeXY6fQ4hWMKpAk9F14wWF"
      ) // CHANGE THE ABOVE ACCESS TOKEN TO THE ONE RECEIVED FROM THE APP.JS FILE
    );
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

// adding new userID's to the mongodb database
async function addId(client, newUserid) {
  result = await client
    .db("Playlists")
    .collection("Users")
    .find({ user_id: newUserid })
    .toArray();

  if (result.length === 0) {
    client
      .db("Playlists")
      .collection("Users")
      .insertOne({ user_id: newUserid });
    console.log("Added new user ID");
  } else {
    console.log("User ID is already in the database");
  }
}
