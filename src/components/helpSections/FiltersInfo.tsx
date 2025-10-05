import React from "react";
import filterSec from "../../assets/filterPage.png";
import { Link } from "react-router-dom";

export default function FiltersInfo() {
    return (
        <div style={{padding: 20}}>
            <div style={{marginBottom: 12}}>
                <Link to="/help">← Back to Help</Link>
            </div>
             <h2>Filters</h2>
             <p>Use filters to sort and find appropriately challenging exercises (e.g. intonation + 1 voice + level 1 + drone).</p>
             <img alt="filters" src={filterSec} width="800" style={{maxWidth: "100%"}} />
         </div>
     );
 }