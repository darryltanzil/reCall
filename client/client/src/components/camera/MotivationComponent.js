import axios from "axios";
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../ui/LivePage.css';

const MotivationComponent = (parentScore) => {
    let [insultText, setInsultText] = useState("");
    const navigate = useNavigate();
    const getInsultOrComp = (theScore) => {
        axios.post("http://localhost:5001/ai-response", theScore)
          .then((response) => {
            const result = response.data;
            setInsultText(result);
        })
    }

    // useEffect(() => {
    //     global.config.insult = "Test" + insultText;
    //     console.log(insultText)
    // }, [insultText])
    //
    // function onFinish() {
    //     let sum = 0;
    //     let average = 0;
    //     getInsultOrComp(parentScore);
    //
    //     console.log("Average is " + average)
    //
    // }

    return (
        <>
            <div className="icons">

                <div class="primary-button-container-lp">
                    <button class="primary-button-lp">
                        <div class="primary-button-div-lp">CHAT-GPT3: {insultText}</div>
                    </button>
                </div>
                {/*<button class="poopoo" onClick={() => {*/}
                {/*    onFinish()}}>*/}
                {/*    Get Feedback*/}
                {/*</button>*/}
            </div>

        </>
    );
}

export default MotivationComponent;