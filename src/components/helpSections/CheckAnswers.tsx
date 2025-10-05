import React from "react";
import check from "../../assets/check-answer.png";
import { Link } from "react-router-dom";

export default function CheckAnswers() {
    return (
        <div style={{padding: 20}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Check Answers</h2>
             <p>After selecting all errors, click "Check Answers" to receive feedback. There will be error/highlight hints and written feedback for incorrect selections.</p>
             <img alt="check answer" src={check} width="700" style={{maxWidth: "100%"}} />
         </div>
     );
 }