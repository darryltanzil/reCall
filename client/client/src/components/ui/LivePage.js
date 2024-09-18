import React from "react";
import CameraComponent from "../camera/CameraComponent";
import "./LivePage.css";
import RecallComponent from "../camera/RecallComponent";
import recallLogo from './recall_logo.png';

export default function LivePage() {
    return (
        <div className="app-container">
            <div className="header-image-container">
                <img src={recallLogo} alt="Header" className="header-image" />
            </div>
            <div className="main-content">
                <div className="RecallComponent">
                    <RecallComponent />
                </div>
                <div className="CameraComponent">
                    <CameraComponent />
                </div>
            </div>
        </div>
    );
}
