import React from "react";
import click from "../../assets/noteClick.png";
import { Link } from "react-router-dom";

export default function NoteClicking() {
    return (
        <div style={{padding: 20}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Clicking Notes</h2>
             <p>Your job is to click on the notes where you hear something different from the score. Click a note multiple times to cycle error types.</p>
             <img alt="note click" src={click} width="800" style={{maxWidth: "100%"}} />
         </div>
     );
 }