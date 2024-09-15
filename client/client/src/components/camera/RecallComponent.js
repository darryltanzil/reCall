import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './SpeechComponent.css'; // Ensure the CSS is imported

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechComponent = () => {
    const recognitionRef = useRef(null);
    const [triggered, setTriggered] = useState(false);
    const lastRecallTime = useRef(0);
    const sentencesAfterTrigger = useRef('');
    const [conversationLog, setConversationLog] = useState([]); // State for conversation log
    const [recognitionStarted, setRecognitionStarted] = useState(false); // New state for tracking recognition start

    const startRecognition = () => { // New function to start recognition
        setRecognitionStarted(true);
    };

    useEffect(() => {
        if (!recognitionRef.current && SpeechRecognition && recognitionStarted) { // Updated condition
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognitionRef.current = recognition;

            recognition.onresult = (event) => {
                let transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join(' ');

                logConversation('User', transcript); // Log user transcript

                const now = Date.now();

                if (triggered) {
                    sentencesAfterTrigger.current += ` ${transcript}`;
                    classifyAndExtractObjectOrAction(sentencesAfterTrigger.current.trim());
                } else if (transcript.toLowerCase().includes('recall') && now - lastRecallTime.current > 2000) {
                    lastRecallTime.current = now;
                    speakText("Yes?");
                    logConversation('Bot', 'Yes?'); // Log bot response
                    setTriggered(true);
                    sentencesAfterTrigger.current = ''; // Reset after "recall"
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event);
                speakText('Could you repeat that?');
                logConversation('Bot', 'Could you repeat that?'); // Log bot error response
            };

            recognition.onend = () => {
                console.log('Speech recognition service disconnected');
            };

            recognition.start();

            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                }
            };
        }
    }, [triggered, recognitionStarted]);

    const classifyAndExtractObjectOrAction = async (sentences) => {
        try {
            const prompt = {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'system',
                    content: `Extract the specific object or action being referred to in the following sentence: "${sentences}". 
                    A good indicator for object is if the sentence relates to finding something, and starts with "where is ..."
                    A good indicator for action is if the sentence relates to an action that was performed, and starts with "did I ..."

                    If an object, it should come from the given sentence, such as "water bottle", "wallet", "hat". 
                    If an action, it should also come from the given sentence, such as "interact with a person", "walk left to right".
                    Respond in the format: { "object": "extracted object" } or for action, { "question": "extracted action" }.`
                }],
                max_tokens: 30
            };

            logConversation('Bot', `Analyzing the sentence: "${sentences}"`); // Log bot analysis

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_TURBO_VISION_API_KEY}` // Use env variable
                },
                body: JSON.stringify(prompt)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            const extractedData = JSON.parse(data.choices[0].message.content);
            logConversation('Bot', `Extraction result: ${JSON.stringify(extractedData)}`); // Log extraction result

            if (extractedData.object) {
                speakText(`I found the object: ${extractedData.object}`);
                logConversation('Bot', `I found the object: ${extractedData.object}`); // Log object found
                await makeGetRequest(`https://recall-irxp2ki0k-skyleapas-projects.vercel.app/find?object=${encodeURIComponent(extractedData.object)}`);
            } else if (extractedData.action) {
                speakText(`I found the action: ${extractedData.action}`);
                logConversation('Bot', `I found the action: ${extractedData.action}`); // Log action found
                await makeGetRequest(`https://recall-irxp2ki0k-skyleapas-projects.vercel.app/action?object=${encodeURIComponent(extractedData.action)}`);
            } else {
                console.log('Could not extract the object or action correctly.');
                speakText('Could not extract the object or action correctly.');
                logConversation('Bot', 'Could not extract the object or action correctly.');
            }

            setTriggered(false); // Reset trigger
        } catch (error) {
            console.error('Error extracting object or action:', error);
            speakText('There was an error processing your request.');
            logConversation('Bot', 'There was an error processing your request.');
        }
    };

    const makeGetRequest = async (url) => {
        try {
            const response = await axios.get(url);
            console.log('GET request successful:', response.data);
            logConversation('Bot', `Response: ${response.data}`); // Log GET request response
            speakText(response.data);
        } catch (error) {
            console.error('Error making GET request:', error);
            speakText('The information could not be found in memory.');
            logConversation('Bot', 'The information could not be found in memory.'); // Log GET request error
        }
    };

    const logConversation = (sender, message) => {
        setConversationLog(prevLog => [...prevLog, { sender, message }]);
    };

    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="message-container">
            <button onClick={startRecognition} className="start-webcam-button">Start Speech Recognition</button> {/* New button */}
            <p className="message-text">Start the sentence with the word "recall" to obtain memories.</p>
            <div className="conversation">
                {conversationLog.map((log, index) => (
                    <p key={index} className={`message ${log.sender === 'User' ? 'user' : 'bot'}`}>
                        <strong>{log.sender}:</strong> {log.message}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default SpeechComponent;
