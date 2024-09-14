const express = require('express');
const bodyParser = require('body-parser');
const find = require('./find');
const action = require('./action');
const db = require('./firebase/firebase');

// this is now in firebase.js
// const serviceAccount = require('./firebase-sdk/recall-dd709-firebase-adminsdk-twy8q-62e9f58ee4.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://recall-dd709.firebaseio.com"
// });

// const db = admin.firestore();

const app = express();
const port = 3000;

app.use(bodyParser.json());

// POST: what is going on in a frame
app.post('/frame', async(req, res) => {
  const { transcript, timestamp, context } = req.body;

  if (!transcript || !timestamp || !context || !context.objects || !context.actions) {
    return res.status(302).json({ error: "Invalid request data" });
  }

  try {
    const docRef = await db.collection('frames').add({
      transcript: transcript,
      timestamp: timestamp,
      context: context // context should have objects and actions
    });

    res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error storing data in Firestore" });
  }

});

// GET: where did I put my ___
app.get('/find', async(req, res) => {
  const { object, time } = req.query;

  if (!object) {
    return res.status(400).json({ error: "Object is required" });
  }

  try {
    const result = await find(object, time);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: did I do this action
app.get('/action', (req, res) => {
  const { action, location, timestamp } = req.query;

  if (!action || !location) { // timestamp should not be required
    return res.status(400).json({ error: "Action and location are required" });
  }

  // TODO: implement finding if action was completed
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
