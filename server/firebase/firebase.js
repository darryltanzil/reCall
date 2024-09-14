const admin = require('firebase-admin');

const serviceAccount = require('./recall-dd709-firebase-adminsdk-twy8q-62e9f58ee4.json');

if (!admin.apps.length) { // to ensure we only have one instance of firebase
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://recall-dd709.firebaseio.com"
    });
}

const db = admin.firestore();
module.exports = db;