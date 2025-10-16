import execPage from "../../assets/exc-page.png";
import { Link } from "react-router-dom";

export default function ExercisesOverview() {
    return (
        <div style={{padding: 20, display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", minHeight: "100%", boxSizing: "border-box", flex: 1}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Exercises</h2>
             <p style={{ textAlign: "left" }}>On the Exercises page, you’ll find a list of the exercises currently uploaded to the site. Each exercise shows a short excerpt of a score and an audio player.</p>
             <img alt="exc-page" src={execPage} style={{width: "100%", maxWidth: "100%", height: "auto", display: "block"}} />
         </div>
     );
 }