import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

// Ensure you have SpeechRecognition available (e.g., via browser API or a library)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechComponent = () => {
    const recognitionRef = useRef(null);
    const [triggered, setTriggered] = useState(false);
    const lastRecallTime = useRef(0);
    const sentencesAfterTrigger = useRef('');

    // OpenAI setup: You'll need your OpenAI API key here
    const configuration = new Configuration({
        apiKey: 'YOUR_OPENAI_API_KEY',  // Replace with your OpenAI API key
    });
    const openai = new OpenAIApi(configuration);

    useEffect(() => {
        if (!recognitionRef.current && SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognitionRef.current = recognition;

            recognition.onresult = (event) => {
                let transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join(' ');

                console.log('Transcribed:', transcript);

                const now = Date.now();

                if (triggered) {
                    // Append new transcript to the sentences after the trigger
                    sentencesAfterTrigger.current += ` ${transcript}`;
                    classifyAndPerformAction(sentencesAfterTrigger.current.trim());
                } else if (transcript.toLowerCase().includes('recall') && now - lastRecallTime.current > 2000) {
                    lastRecallTime.current = now;
                    console.log(`"Recall" detected in sentence: ${transcript}`);
                    setTriggered(true);
                    sentencesAfterTrigger.current = ''; // Reset after "recall"
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event);
            };

            recognition.onend = () => {
                console.log('Speech recognition service disconnected');
            };

            recognition.start();

            // Cleanup function
            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                }
            };
        }
    }, [triggered]);

    // Function to classify intent using OpenAI
    const classifyAndPerformAction = async (sentences) => {
        try {
            const prompt = `Determine if the following sentence is about finding an object or performing an action: "${sentences}". Reply with "find" or "action".`;

            const response = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 10,
            });

            const intent = response.data.choices[0].text.trim().toLowerCase();
            console.log('OpenAI classification:', intent);

            if (intent === 'find') {
                await makeGetRequest('https://recall-irxp2ki0k-skyleapas-projects.vercel.app/find');
            } else if (intent === 'action') {
                await makeGetRequest('https://recall-irxp2ki0k-skyleapas-projects.vercel.app/action');
            } else {
                console.log('Could not classify the intent correctly.');
            }

            // Reset trigger after action
            setTriggered(false);
        } catch (error) {
            console.error('Error classifying sentence:', error);
        }
    };

    // Function to make GET request
    const makeGetRequest = async (url) => {
        try {
            const response = await axios.get(url);
            console.log('GET request successful:', response.data);
        } catch (error) {
            console.error('Error making GET request:', error);
        }
    };

    return (
        <div>
            <p>Listen for the word "recall" to start capturing sentences...</p>
            {/* Optionally display or use the sentencesAfterTrigger.current data */}
        </div>
    );
};

export default SpeechComponent;
