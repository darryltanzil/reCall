import React, { useState, useRef, useEffect } from 'react';
import "./CameraStyle.css";
import html2canvas from 'html2canvas';
import MotivationComponent from './MotivationComponent';

const CameraComponent = () => {
    const [stream, setStream] = useState(null);
    const [score, setScore] = useState(null);
    const [scoreArray, setScoreArray] = useState([]);
    const [screenshotUrls, setScreenshotUrls] = useState([]);
    const screenshotCount = useRef(0);

    const webcamVideo = useRef();
    const canvasRef = useRef();

    let videoWidth = 680;
    let videoHeight = 480;


    const startVideoStream = async () => {
        try {
            let newStream = await navigator.mediaDevices
                .getUserMedia({
                    video: {
                        facingMode: 'user',
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
            console.log('Error: User denied permission for video stream', err);
        }
    }


    const startStream = async () => {
        await startVideoStream();

        const render = async () => {
            const context = canvasRef.current.getContext('2d');
            setInterval(() => {
                context.drawImage(webcamVideo.current, 0, 0, videoWidth, videoHeight);
                const screenshotDataUrl = canvasRef.current.toDataURL('image/png');
                setScreenshotUrls(prevScreenshotUrls => [...prevScreenshotUrls, screenshotDataUrl]);
                screenshotCount.current += 1; // increment screenshotCount

                if (screenshotCount.current % 9 === 0) {
                    const imageGrid = document.getElementById('imageGrid');
                    html2canvas(imageGrid).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'screenshot.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    });
                    screenshotCount.current = 0; // reset screenshotCount to 0
                    imageGrid.innerHTML = ''; // clear imageGrid
                }
            }, 500);
        }

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

            <div class="arg">
                <div class="modified-container-lp">
                    <button class="modified-button-lp">
                        <div class="title-description-dp">
                            Score: {score}
                        </div>
                    </button>
                </div>

                <button class = "peepee" onClick={() => startStream()}>
                    Start webcam
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
        </>
    );
}

export default CameraComponent;