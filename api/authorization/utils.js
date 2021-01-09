require("dotenv").config({path: __dirname+'/./../../.env'});
const axios = require("axios");
const qs = require("qs");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:8888/auth/loggedin'

const { MongoClient } = require("mongodb");


// checks if the user has logged in before or not
async function checkUser(access_token) {
  try {
    const response = await axios({
      method: "get",
      url: `https://api.spotify.com/v1/me`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    let userId = response.data.id;
  } catch (err) {
    console.log(err.response);
  }
  
  const uri =
  "mongodb+srv://doraemon:Fion2002@cluster0.kssuc.mongodb.net/myspotify?authSource=admin&replicaSet=atlas-nimc8j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

  const client = new MongoClient(uri);

  let result = await client
    .db("Playlists")
    .collection("Users")
    .find({ user_id: userId })
    .toArray();

  if (result.length === 0) {
    client
      .db("Playlists")
      .collection("Users")
      .insertOne({ user_id: userId });
  }
  return userId;

}

// returns the access and refresh tokens given an authCode
async function getTokens(authCode) {
  try {
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
  } catch (err) {
    console.log(err.response)
  }
}

getTokens('AQAYmoE4ezq-_YUE5rU6iWelCPLLsVDQp6feOUOQ4F4iWimq4swpDJ1Xbt2KbZsEuNsGDnMofi6trLZK6x1PwJn0UxYD0jhYXxS1oUC1TERjL6KR7sIrB0gFUFRS9af6srUORiBIb-xmppKTIaz1CGA563fGjoPKbPA39cSU-KVnGCntcJqaJxPrKJxhsskuW6mo-6FEhOEtxXTotUvHCJxjXb6GLHM_29-cPoJrq13IT2lo2aClJfN-FVa9hf0XdtqgSwtUV7rJMRieW4-WDnDO2rczB8ueDQe0c-02UCioFsSS2yTJmZEZg58NdKBkgKy0L5SrQeJkFpQmrQj0qMEnz1AIeU802d7uWTYcHrw')

module.exports = {
  checkUser, 
  getTokens,

};