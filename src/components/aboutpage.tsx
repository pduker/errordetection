//import { useState } from "react";
//import noteKey from "../assets/note-color-key.png";

export function AboutPage() {
    return (
        <div>
            <h2>About</h2>
            <div className="about">
                <div style={{ textAlign: 'left' }}>
                    This website is an error detection practice tool! Choose a category of exercises above to get started, or visit the Help page to learn more. See a problem? Please get in touch with Phil Duker.
                </div>
                <br />
                <div style={{ textAlign: 'left' }}>
                    This project was led by Phil Duker with the help of the following wonderful UD students: Alex Daley, Weldin Dunn, Benjamin McMonagle, Sean O’Sullivan, Sonika Sharma, Colin Stetler, Victor Umoren-Udo, and Lillian Woulfe.
                </div>
                <br />
                <div style={{ textAlign: 'left' }}>
                    This project was funded by through a Paul J. Rickards, Jr. Teaching Innovation Grant and supported through the university of Delaware’s Academic Technology Services (with thanks to Erin Sicuranza, Colleen Kelemen, Racine Lewis, and Jessica Schroeder).
                </div>
            </div>
        </div>
    );
}
