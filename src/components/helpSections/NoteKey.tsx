import React from "react";
import noteKey from "../../assets/note-color-key.png";
import { Link } from "react-router-dom";

export default function NoteKey() {
    return (
        <div style={{padding: 20}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Color Key</h2>
             <p>The key shows which color corresponds to each type of error.</p>
             <img alt="note-color-key" src={noteKey} width="500" style={{maxWidth: "100%"}} />
         </div>
     );
 }