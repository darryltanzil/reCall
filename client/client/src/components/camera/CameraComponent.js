import React, { useState, useRef } from 'react';
import "./CameraStyle.css";
import html2canvas from 'html2canvas';
import MotivationComponent from './MotivationComponent';

const CameraComponent = () => {
    const [stream, setStream] = useState(null);
    const [score, setScore] = useState(null);
    const [screenshotUrls, setScreenshotUrls] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const screenshotCount = useRef(0);

    const webcamVideo = useRef();
    const canvasRef = useRef();

    const videoWidth = 680;
    const videoHeight = 480;

    const startVideoStream = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            console.log('Available media devices:', devices);

            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            const continuityCameraDevice = videoDevices.find(device =>
                device.label.includes('iPhone') || device.label.includes('Continuity')
            );

            if (!continuityCameraDevice) {
                console.error('iPhone Continuity Camera not found');
                return;
            }

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: continuityCameraDevice.deviceId, // Use the iPhone's device ID
                    width: videoWidth,
                    height: videoHeight
                },
                audio: false,
            });

            webcamVideo.current.srcObject = newStream;
            webcamVideo.current.width = videoWidth;
            webcamVideo.current.height = videoHeight;
            setStream(newStream);

        } catch (err) {
            console.error('Error: Failed to access the video stream', err);
        }
    };


    const encodeImage = (imageBlob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });
    };

    const sendToAPI = async (base64Image) => {
        const prompt = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: 'The image shows video frames in sequence. Summarize this panel by filling out the following JSON object using the info from the image: ' +
                                JSON.stringify({
                                    transcript: "Describe what’s likely going on in each frame as a short transcript.",
                                    context: {
                                        objects: "List all key objects in this panel as an array.",
                                        actions: "One string describing the action of the panel.",
                                        location: "Give your best guess of the location in this panel."
                                    }
                                })
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    "name": "frame_description",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "transcript": {
                                "type": "string",
                                "description": "Describe what’s likely going on in each frame as a short transcript."
                            },
                            "context": {
                                "type": "object",
                                "properties": {
                                    "objects": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        },
                                        "description": "List all key objects in this panel as an array."
                                    },
                                    "actions": {
                                        "type": "string",
                                        "description": "One string describing the action of the panel."
                                    },
                                    "location": {
                                        "type": "string",
                                        "description": "Give your best guess of the location in this panel."
                                    }
                                },
                                "required": ["objects", "actions", "location"],
                                "additionalProperties": false
                            }
                        },
                        "required": ["transcript", "context"],
                        "additionalProperties": false
                    }
                }

            },
            max_tokens: 300
        };

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_TURBO_VISION_API_KEY}`
                },
                body: JSON.stringify(prompt)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('API response:', JSON.stringify(data.choices[0].message.content, null, 2));
            return data;
        } catch (error) {
            console.error('Error sending image to API:', error);
        }
    };

    const handleScreenshotClick = async () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(webcamVideo.current, 0, 0, videoWidth, videoHeight);

        canvasRef.current.toBlob(async (blob) => {
            const base64Image = await encodeImage(blob);

            const apiResponse = await sendToAPI(base64Image);

            setApiResponse(apiResponse);

            if (apiResponse && apiResponse.choices && apiResponse.choices[0]) {
                setScore(apiResponse.choices[0].message.content);
            }
        }, 'image/png');
    };

    const startStream = async () => {
        await startVideoStream();

        const render = async () => {
            const context = canvasRef.current.getContext('2d');
            setInterval(() => {
                context.drawImage(webcamVideo.current, 0, 0, videoWidth, videoHeight);
                const screenshotDataUrl = canvasRef.current.toDataURL('image/png');
                setScreenshotUrls(prevScreenshotUrls => [...prevScreenshotUrls, screenshotDataUrl]);
                screenshotCount.current += 1;

                if (screenshotCount.current % 9 === 0) {
                    const imageGrid = document.getElementById('imageGrid');
                    html2canvas(imageGrid).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'screenshot.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    });
                    screenshotCount.current = 0;
                    imageGrid.innerHTML = '';
                }
            }, 1000);
        };

        render();
    };

    return (
        <>
            <div className='tensorflow-container'>
                <div className="container">
                    <video ref={webcamVideo} id="webCamVideo" autoPlay playsInline></video>
                    <canvas ref={canvasRef} id="canvasRef" width={videoWidth} height={videoHeight}/>
                </div>
            </div>

            <div className="arg">
                <div className="modified-container-lp">
                    <button className="modified-button-lp">
                        <div className="title-description-dp">
                            Score: {score}
                        </div>
                    </button>
                </div>

                <button className="peepee" onClick={() => startStream()}>
                    Start webcam
                </button>

                <button className="send-screenshot" onClick={handleScreenshotClick}>
                    Send Screenshot to API
                </button>
            </div>

            <MotivationComponent parentScore={score} />

            <div id="imageGrid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gap: '10px'
            }}>
                {screenshotUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Screenshot ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                ))}
            </div>

            {/* Display the API response */}
            <div className="api-response">
                <h3>API Response:</h3>
                {apiResponse ? (
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                    <p>No response yet. Click "Send Screenshot to API" to see the result.</p>
                )}
            </div>
        </>
    );
};

export default CameraComponent;
