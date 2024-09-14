const cohere = require('cohere-ai');
const db = require('./firebase/firebase');
const { calculateTimeAgo } = require('./find');

const API_KEY = '';

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
    
            // Chat request to Cohere
            const response = await cohere.chat({
                message: `Based on the following information, can you predict whether the action happened or not? 
                Question: "${question}". Context: ${context.objects.join(', ')}. Transcript: ${transcript}`
            });

            const prediction = response.text.trim().toLowerCase();  // Get the prediction
            const timeAgo = calculateTimeAgo(data.timestamp); // Calculate "time ago" from timestamp

            // Assuming that the response includes something like "yes" or "no"
            if (prediction.includes('yes')) {
                return {
                    actionPerformed: true,
                    location: context.location,
                    timeAgo: timeAgo
                };
            }
        }
    
        // If no high-confidence match found
        return { 
            actionPerformed: false
        };
    } catch (error) {
        console.error('Error finding action:', error);
        throw new Error('Error retrieving data or making API request');
    }
}

module.exports = action;
