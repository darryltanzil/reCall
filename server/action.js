const cohere = require('cohere-ai');
const db = require('./firebase/firebase');
const { calculateTimeAgo } = require('./find');
const { CohereClient } = require("cohere-ai");

const API_KEY = '';

const client = new CohereClient({ token: API_KEY });      
/**
 * Finds the location and timestamp of an action by analyzing if the action was performed.
 * @param {string} question - The question/action to search for.
 * @returns {Promise<Object>} - The result containing actionPerformed, location, and timeAgo.
 */
async function action(question) {
    try {
        // Get the current time and the time from 2 weeks ago
        const now = new Date();
        const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
    
        // Fetch recent data from Firebase
        const snapshot = await db.collection('frame')
            .where('timestamp', '>=', twoWeeksAgo.toISOString())
            .orderBy('timestamp', 'desc')
            .get();
    
        if (snapshot.empty) {
            return { actionPerformed: false };
        }
    
        // Iterate over each document and check with Cohere Chat API
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const context = data.context;
            const transcript = data.transcript;
      
            const response = await client.chat(
                {
                    message: `You are a backend assistant designed to help determine whether an action/question has occurred. 
                            You will receive the question, as well as data that you will use to determine whether the question has happened or not.
                            Start the answer with a "yes" or "no", and then answer the question in one sentence, saying nothing about the given data, and only a confirmation/denial of the action that happened.
                            Based on the following information, can you predict whether the action in the question happened or not?
                            For example: "yes, you did leave your water bottle on the table"
                            question: ${question}
                            transcript: ${transcript}  
                            context: ${context.objects.join(', ')}`,
                    model: "command-r-plus",
                    preamble: "You are a backend assistant designed to help determine whether an action/question has occurred. You will receive the question, as well as data in the form of a transcript and content that you will use to determine whether the question has happened or not."
                }
            )

            const prediction = response.text.trim().toLowerCase();  // Get the prediction
            const timeAgo = calculateTimeAgo(new Date(data.timestamp)); // Calculate "time ago" from timestamp

            if (prediction.includes('yes')) {
                return {
                    actionPerformed: true,
                    response: prediction,
                    location: context.location,
                    timeAgo: timeAgo
                    };
                }
            }
    
        return {
            response: prediction,
            actionPerformed: false
        };
    } catch (error) {
        console.error('Error finding action:', error);
        throw new Error('Error retrieving data or making API request');
    }
}

module.exports = action;