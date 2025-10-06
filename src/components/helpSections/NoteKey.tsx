import noteKey from "../../assets/note-color-key.png";
import { Link } from "react-router-dom";

export default function NoteKey() {
    return (
        <div style={{padding: 20, display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", minHeight: "100%", boxSizing: "border-box", flex: 1}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Color Key</h2>
             <p style={{ textAlign: "left" }}>The key shows which color corresponds to each type of error.</p>
             <img alt="note-color-key" src={noteKey} style={{width: "100%", maxWidth: "100%", height: "auto", display: "block"}} />
         </div>
     );
 }