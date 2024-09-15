import React from "react";
import CameraComponent from "../camera/CameraComponent";
import "./LivePage.css";
import RecallComponent from "../camera/RecallComponent";

export default function LivePage() {
  return (
      <div className="app-container">
        <div className="RecallComponent">
          <RecallComponent />
        </div>
        <div className="CameraComponent">
          <CameraComponent />
        </div>
      </div>
  );
}