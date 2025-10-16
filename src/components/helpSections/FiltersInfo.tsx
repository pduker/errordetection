import filterSec from "../../assets/filterPage.png";
import { Link } from "react-router-dom";

export default function FiltersInfo() {
    return (
        <div style={{padding: 20, display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", minHeight: "100%", boxSizing: "border-box", flex: 1}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Filters</h2>
             <p style={{ textAlign: "left" }}>Use filters to sort and find appropriately challenging exercises (e.g. intonation + 1 voice + level 1 + drone).</p>
             <img alt="filters" src={filterSec} style={{width: "100%", maxWidth: "100%", height: "auto", display: "block"}} />
         </div>
     );
 }