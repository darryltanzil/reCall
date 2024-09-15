import React, { useEffect, useRef, useState } from 'react';

// Ensure you have SpeechRecognition available (e.g., via browser API or a library)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechComponent = () => {
    const recognitionRef = useRef(null);
    const [triggered, setTriggered] = useState(false);
    const lastRecallTime = useRef(0);
    const sentencesAfterTrigger = useRef('');

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

    return (
        <div>
            <p>Listen for the word "recall" to start capturing sentences...</p>
            {/* Optionally display or use the sentencesAfterTrigger.current data */}
        </div>
    );
};

export default SpeechComponent;
