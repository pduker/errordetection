import React from "react";import click from "../../assets/noteClick.png";
import { Link } from "react-router-dom";

export default function NoteClicking() {
    return (
        <div style={{padding: 20, display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", minHeight: "100%", boxSizing: "border-box", flex: 1}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Clicking Notes</h2>
             <p style={{ textAlign: "left" }}>Your job is to click on the notes where you hear something different from the score. Click a note multiple times to cycle error types.</p>
             <img
                alt="note click"
                src={click}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  transform: "translateY(-20px)"
                }}
             />
         </div>
     );
 }