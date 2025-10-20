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
                    This project was led by Phil Duker with the help of the following wonderful UD students:
                    <ul>
                        <li>Alex Daley</li>
                        <li>Weldin Dunn</li>
                        <li>Benjamin McMonagle</li>
                        <li>Sean O'Sullivan</li>
                        <li>Sonika Sharma</li>
                        <li>Colin Stetler</li>
                        <li>Victor Umoren-Udo</li>
                        <li>Lillian Woulfe</li>
                        <li>Adam Beck</li>
                        <li>Sehee Hwang</li>
                        <li>Michael Murphy</li>
                        <li>Mann Patel</li>
                        <li>Tyran Rice</li>
                        <li>Sydni Wright</li>
                    </ul>
                </div>
                <br />
                <div style={{ textAlign: 'left' }}>
                    This project was funded by through a Paul J. Rickards, Jr. Teaching Innovation Grant and supported through the University of Delaware’s Academic Technology Services (with thanks to Erin Sicuranza, Colleen Kelemen, Racine Lewis, and Jessica Schroeder).
                </div>
            </div>
        </div>
    );
}
