const action = require('./action');
const bodyParser = require('body-parser');
const db = require('./firebase/firebase');
const express = require('express');
const find = require('./find');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// POST: what is going on in a frame
app.post('/frame', async(req, res) => {
  const { transcript, timestamp, context } = req.body;

  if (!transcript || !timestamp || !context || !context.objects || !context.actions || !context.location) {
    return res.status(302).json({ error: "Invalid request data" });
  }

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
app.get('/find', async(req, res) => {
  const { object, timestamp } = req.query;

  if (!object || !timestamp) {
    return res.status(400).json({ error: "Object is required" });
  }

  try {
    const result = await find(object, timestamp);
    
    const replyString = `The ${object} was last seen at ${result.location}, ${result.timeAgo} ago. 
                        Here is a memory snapshot: ${result.panel}`;

    res.send(replyString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: did I do this action
app.get('/action', async(req, res) => {
  const { question } = req.query;

  if (!question) { // timestamp should not be required
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await action(question);
    const replyString = `You have not ${question} in the last ${result.timeAgo}`;
    if (result.actionPerformed()) {
      replyString = `You ${question} at ${result.location}, ${result.timeAgo}`;
    }

    res.send(replyString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
