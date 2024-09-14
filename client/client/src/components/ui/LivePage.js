import React from "react";
import CameraComponent from "../camera/CameraComponent";
import "./LivePage.css";
import RecallComponent from "../camera/RecallComponent";


export default function LivePage() {
  return (
    <div>
      <div>
        <div>
          <div className="LivePage">
            <RecallComponent />
            <CameraComponent />
          </div>
        </div>
    </div>
    </div>
  );
}
