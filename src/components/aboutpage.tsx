//import { useState } from "react";
//import noteKey from "../assets/note-color-key.png";

//code for about page
export function AboutPage() {
    return (
        <div>
            {/* header for page */}
            <h2>About</h2>
            
            {/* class for about text */}
            <div className="about">
                <div style={{ textAlign: 'left' }}>
                    This website is an error detection practice tool! Choose a category of exercises above to get started, or visit the Help page to learn more. See a problem? Please get in touch with Phil Duker.
                </div>
                <br />
                <div style={{ textAlign: 'left' }}>
                    This project was led by Phil Duker with the help of the following wonderful UD students: Alex Daley, Weldin Dunn, Benjamin McMonagle, Sean O’Sullivan, Sonika Sharma, Colin Stetler, Victor Umoren-Udo, Lillian Woulfe, Adam Beck, Sehee Hwang, Michael Murphy, Mann Patel, Tyran Rice, and Sydni Wright.
                </div>
                <br />
                <div style={{ textAlign: 'left' }}>
                    This project was funded by through a Paul J. Rickards, Jr. Teaching Innovation Grant and supported through the University of Delaware’s Academic Technology Services (with thanks to Erin Sicuranza, Colleen Kelemen, Racine Lewis, and Jessica Schroeder).
                </div>
            </div>
        </div>
    );
}
