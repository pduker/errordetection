import React from "react";
import execPage from "../../assets/exc-page.png";
import { Link } from "react-router-dom";

export default function ExercisesOverview() {
    return (
        <div style={{padding: 20}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Exercises</h2>
             <p>On the Exercises page, you’ll find a list of the exercises currently uploaded to the site. Each exercise shows a short excerpt of a score and an audio player.</p>
             <img alt="exc-page" src={execPage} width="800" style={{maxWidth: "100%"}} />
         </div>
     );
 }