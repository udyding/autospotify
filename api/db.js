const MongoClient = require('mongodb').MongoClient;
let client = null;

// create a connection to url and call callback()
function connect(url, callback) {
    if (client == null) {
        client = new MongoClient(url, { useUnifiedTopology: true });
        // establish a new connection
        client.connect((err) => {
            if (err) {
                // error occurred during connection
                client = null;
                callback(err);
            } else {
                // all done
                callback();
            }
        });
    } else {
        // connection is already there
        callback();
    }
}

// get database using pre-established connection
function db(nameDb) {
    return client.db(nameDb);
}

function close() {
    if (client) {
        client.close();
        client = null;
    }
}


module.exports = {
    connect,
    db,
    close
};