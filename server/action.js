const db = require('./firebase/firebase');
const { calculateTimeAgo } = require('./find');
const { OpenAI } = require('openai');  // Import OpenAI SDK

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
            return { actionPerformed: false, response: 'No records found' };
        }

        // Combine data from all documents into a single string
        const records = snapshot.docs.map((doc) => {
            const data = doc.data();
            const context = data.context;
            const transcript = data.transcript;
            const timestamp = new Date(data.timestamp).toISOString();

            return `Transcript: ${transcript}.
                    Context: Objects: ${context.objects.join(', ')}, Actions: ${context.actions}, Location: ${context.location}.
                    Timestamp: ${timestamp}`;
        }).join('\n\n');

        // Send the entire dataset to GPT for analysis
        const response = await openai.chat.completions.create({
            model: "gpt-4",  // or use the specific GPT model you want
            messages: [
                { role: "system", content: "You are a backend assistant designed to help determine whether an action/question has occurred. You will receive a question and several records of recent events. Your task is to evaluate all the records and determine whether the action in the question occurred anytime recently. Provide a short confirmation message if the action is identified. If the action is not found, state that no records match the action. You do not need to give any information about the record itself, such as the timestamp. Keep it to 1 sentence." },
                { role: "user", content: `Question: ${question}\nRecent records:\n${records}` }
            ],
            max_tokens: 150,  // Adjust based on your needs
        });

        // Clean the response
        const cleanedResponse = response.choices[0].message.content.trim().toLowerCase();

        // Check if the response indicates that the action was performed
        if (cleanedResponse.startsWith('yes')) {
            // Extract timestamp from the response
            const matchingRecord = snapshot.docs.find(doc => {
                const data = doc.data();
                const transcript = data.transcript;
                const context = data.context;
                return cleanedResponse.includes(transcript) || cleanedResponse.includes(context.objects.join(', '));
            });
            const timeAgo = matchingRecord ? calculateTimeAgo(new Date(matchingRecord.data().timestamp)) : null;

            return {
                actionPerformed: true,
                response: cleanedResponse,
                timeAgo: timeAgo
            };
        }

        // If no action was performed or GPT didn't find a match
        return {
            actionPerformed: false,
            response: cleanedResponse
        };
    } catch (error) {
        console.error('Error finding action:', error);
        throw new Error('Error retrieving data or making API request');
    }
}

module.exports = action;
