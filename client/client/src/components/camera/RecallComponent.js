import React, { useState, useEffect, useRef } from 'react';

// SpeechRecognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const RecallListener = () => {
    const [listening, setListening] = useState(false);
    const [triggered, setTriggered] = useState(false);
    const [recordedText, setRecordedText] = useState('');
    const [response, setResponse] = useState('');
    const sentencesAfterTrigger = useRef(''); // Use a string to store spoken text until a pause
    const recognitionRef = useRef(null); // Store the SpeechRecognition instance
    const lastRecallTime = useRef(0); // Track the last time "recall" was detected to debounce

    useEffect(() => {
        if (!recognitionRef.current && SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                console.log('Transcribed:', transcript);

                const now = Date.now();

                if (triggered) {
                    sentencesAfterTrigger.current += ` ${transcript}`;
                } else if (transcript.toLowerCase().includes('recall') && now - lastRecallTime.current > 2000) {
                    lastRecallTime.current = now;
                    console.log(`"Recall" detected in sentence: ${transcript}`);
                    setTriggered(true);
                    sentencesAfterTrigger.current = ''; // Reset after "recall"
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
            };

            recognition.onend = async () => {
                if (triggered) {
                    const capturedText = sentencesAfterTrigger.current.trim();
                    setRecordedText(capturedText);
                    setTriggered(false);
                    sentencesAfterTrigger.current = '';

                    // Call OpenAI API with the captured text
                    await sendToAPI(capturedText);
                }

                if (listening) {
                    recognition.start();
                }
            };

            recognitionRef.current = recognition;
        }
    }, [triggered]);

    useEffect(() => {
        if (listening && recognitionRef.current) {
            recognitionRef.current.start();
        } else if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [listening]);

    const handleListeningToggle = () => {
        setListening(!listening);
    };

    const handleShowResponse = () => {
        setResponse(recordedText);
    };

    // Function to send data to the OpenAI API
    const sendToAPI = async (transcript) => {
        const apiRequest = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `The following transcript was captured: ${transcript}. Did this action occur?` // Modify this prompt as needed
                        }
                    ]
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "action_check",
                    schema: {
                        type: "object",
                        properties: {
                            actionPerformed: { type: "boolean" },
                            location: { type: "string" },
                            timestamp: { type: "string" }
                        },
                        required: ["actionPerformed", "location"]
                    }
                }
            },
            max_tokens: 300
        };

        try {
            // Assume you're using fetch to make the request
            const response = await fetch("https://api.openai.com/v1/endpoint", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer YOUR_OPENAI_API_KEY`
                },
                body: JSON.stringify(apiRequest),
            });
            const result = await response.json();
            console.log('API Response:', result);

            // Further processing if needed
            if (result.actionPerformed) {
                console.log(`Action was performed at ${result.location} on ${result.timestamp}`);
            } else {
                console.log('Action not performed.');
            }
        } catch (error) {
            console.error('Error calling the API:', error);
        }
    };

    return (
        <div>
            <h1>Recall Listener</h1>
            <button onClick={handleListeningToggle}>
                {listening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <p>{listening ? 'Listening...' : 'Not listening'}</p>

            <button onClick={handleShowResponse}>Show Recorded Sentences</button>
            {response && (
                <div>
                    <h2>Recorded Text After "Recall":</h2>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
};

export default RecallListener;
