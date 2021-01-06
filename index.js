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
        "BQCIv9xu8JkbY1ko-Kry2x97fvdee1fO4RJN4XFvWKF7UisGJsK6evEas7AmcOCxM4kQ33ZabOZn5QdsStsYnLpfvi4npa_ISqXf0K6meN7Zvpbza0E7Rl0Nv-_hZQTBWu-WA7Aj7JiF-sbe333MldYeLhhOZPrVYV-nPUuwZoUAopBhN9fii4YP6ZKpIvicJx-8TN7OwkLW8nKGbOhAE0LJK-Ci3VhpV070ybyWcujqj8YPyAakujE3KwDsYg_IUBwuLqZELz7A"
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
        "BQCIv9xu8JkbY1ko-Kry2x97fvdee1fO4RJN4XFvWKF7UisGJsK6evEas7AmcOCxM4kQ33ZabOZn5QdsStsYnLpfvi4npa_ISqXf0K6meN7Zvpbza0E7Rl0Nv-_hZQTBWu-WA7Aj7JiF-sbe333MldYeLhhOZPrVYV-nPUuwZoUAopBhN9fii4YP6ZKpIvicJx-8TN7OwkLW8nKGbOhAE0LJK-Ci3VhpV070ybyWcujqj8YPyAakujE3KwDsYg_IUBwuLqZELz7A"
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
