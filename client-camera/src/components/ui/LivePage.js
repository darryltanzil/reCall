import React from "react";
import CameraComponent from "../tensorflow/CameraComponent";
import "./LivePage.css";


export default function LivePage() {
  return (
    <div>
      <div>
        <div>
          <div className="LivePage">
            <CameraComponent />
          </div>
        </div>
    </div>
    </div>
  );
}
