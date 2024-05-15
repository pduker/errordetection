import { useState } from "react";
import noteKey from "../assets/note-color-key.png"

export function AboutPage() {
    return (
        <div>
           
           <div className="container ">
          
          <h3>About</h3>
        <div style={{margin: "10px", padding: "10px", backgroundColor: "#fcfcd2", borderRadius: "10px"}}>
          <div>
          This website is an error detection practice tool!
            Choose a category of exercises above to get started, or visit the Help page to learn more. 
            See a problem? Please get in touch with Phil Duker

          </div>
          <br />
    
          <div>
            This project was funded by through a Paul J. Rickards,
            Jr. Teaching Innovation Grant and supported through the university of Delaware’s Academic Technology Services 
            (with thanks to Erin Sicuranza, Colleen Kelemen, Racine Lewis, and Jessica Schroeder).
          </div>
        </div>
       
      </div>
        </div>
    );
}
