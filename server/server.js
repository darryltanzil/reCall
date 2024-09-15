const action = require('./action');
const bodyParser = require('body-parser');
const db = require('./firebase/firebase');
const express = require('express');
const { find } = require('./find');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the reCall server!');
});

// POST: what is going on in a frame
app.post('/frame', async (req, res) => {
  const { transcript, timestamp, context } = req.body;

  try {
    const docRef = await db.collection('frame').add({
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
app.get('/find', async (req, res) => {
  const { object, timestamp } = req.query;

  try {
    const result = await find(object, timestamp);
    let replyString = `The ${object} was last seen at ${result.location}, ${result.timeAgo}.`;
    if (result.location == "Unknown") {
      replyString = `Could not find ${object} in your memories`
    }

    res.send(replyString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: did I do this action
app.get('/action', async (req, res) => {
  const { question } = req.query;

  try {
    const result = await action(question);

    let replyString = `${result}`;
    
    if (result.actionPerformed) {
      replyString = `${result.response} ${result.timeAgo}`;
    }
    res.send(replyString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
