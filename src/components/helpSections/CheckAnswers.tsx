import check from "../../assets/check-answer.png";
import { Link } from "react-router-dom";

export default function CheckAnswers() {
    return (
        <div style={{padding: 20, display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", minHeight: "100%", boxSizing: "border-box", flex: 1}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Check Answers</h2>
             <p style={{ textAlign: "left" }}>After selecting all errors, click "Check Answers" to receive feedback. There will be error/highlight hints and written feedback for incorrect selections.</p>
             <img alt="check answer" src={check} style={{width: "100%", maxWidth: "100%", height: "auto", display: "block"}} />
         </div>
     );
 }