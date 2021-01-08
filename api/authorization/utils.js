const axios = require("axios");
const qs = require("qs");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.HOST;

const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

const client = new MongoClient(uri);

async function putIdInDatabase(authCode) {
  try {
    await client.connect();
    await addId(client, await findId(authCode));
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

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

// adding new userID's to the mongodb database
async function addId(client, newUserId) {
  result = await client
    .db("Playlists")
    .collection("Users")
    .find({ user_id: newUserId })
    .toArray();

  if (result.length === 0) {
    client
      .db("Playlists")
      .collection("Users")
      .insertOne({ user_id: newUserId });
    console.log("Added new user ID");
    return true;
  } else {
    console.log("User ID is already in the database");
    return true;
  }
}

async function getTokens(authCode) {
  const response = await axios({
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    data: qs.stringify({
      grant_type: "authorization_code",
      client_id: client_id,
      client_secret: client_secret,
      code: authCode,
      redirect_uri: redirect_uri,
    }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
  console.log(response.data);
  return response.data;
}
