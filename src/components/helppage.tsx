//imports
import '../styles/about.css';
import '../styles/help.css';

// import { sha256 } from 'js-sha256';

import { useState } from "react";
import noteKey from "../assets/note-color-key.png"
import exExample from "../assets/excersie-example.png"
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/database"
import execPage from "../assets/exc-page.png";
import filterSec from "../assets/filterPage.png";
import click from "../assets/noteClick.png";
import check from "../assets/check-answer.png";

//function for creating the help page, for authorized users
export function HelpPage({
    authorized,
    setAuthorized
}: {
    authorized: boolean;
    setAuthorized: ((authorized: boolean) => void);
}) {
    //setting state
    const [error, setError] = useState<boolean>(false);

    //checking user with login functionality

    const login = async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("Logged in as:", userCredential.user.email);
          // Set admin privileges based on login
          setAuthorized(true);
          setError(false);
        } catch (error) {
          console.error("Login failed");
          setError(true);
        }
    };
    
    const checkAuth = function() {
        var box1 = document.getElementById("mng-email");
        var box2 = document.getElementById("mng-pwd");
        if(box2 !== null && "value" in box2 && box1 !== null && "value" in box1) {
            var email = box1.value as string;
            var password = box2.value as string;
            login(email,password);
        }
    }

    //rendering page with help information
    return (
        <div className="about-page-wrapper">
            <div className="about-page help-page">
                <section className="about-hero help-hero">
                    <p className="eyebrow">Help &amp; Support</p>
                    <h1>Welcome to the Help Page!</h1>
                    <p>
                        This site is meant to help you practice your <strong>error detection skills</strong>. Every
                        exercise pairs a <strong>music score</strong> with an <strong>audio sample</strong>. The
                        recording should match the score, but there is always <strong>at least one incorrect note</strong>.
                    </p>
                    <p>
                        Carefully reviewing the score while you listen trains you to spot mismatches quickly and builds
                        musicianship in a focused, repeatable way.
                    </p>
                    <div className="about-highlight">
                        Need additional guidance? Explore the sections below or reach out to <a className="inline-link highlight-email" href="mailto:pduker@udel.edu" data-label="pduker@udel.edu">Phil Duker</a> and the Outclassed
                        Dev Team for support.
                    </div>
                </section>

                <section className="help-section help-section--split">
                    <div className="help-card help-card--medium">
                        <h3>Browse the library</h3>
                        <p>
                            On the <strong>Exercises</strong> page you’ll find every exercise currently stored in the database.
                        </p>
                    </div>
                    <div className="help-card help-card--medium">
                        <h3>Side-by-side practice</h3>
                        <p>
                            Select any title to load the score, audio player, and answer tools side by side.
                        </p>
                    </div>
                    <div className="help-image">
                        <img
                            alt="Exercises page overview"
                            src={execPage}
                            width="500"
                            height="300"
                        />
                    </div>
                </section>

                <section className="help-section help-section--split">
                    <div className="help-image">
                        <img
                            alt="Filter controls"
                            src={filterSec}
                            width="500"
                            height="300"
                        />
                    </div>
                    <div className="help-card help-card--wide">
                        <h3>Dial in the right difficulty</h3>
                        <p>
                            Use the <strong>filters</strong> to quickly find appropriately challenging exercises. Tags cover
                            Pitch, Intonation, and Rhythm; additional options narrow by voices, difficulty, meter, transposition,
                            or textural factors. If you are new, consider starting with <i>Intonation + 1 voice + Level 1</i>.
                        </p>
                    </div>
                </section>

                <section className="help-section help-section--split">
                    <div className="help-image">
                        <img
                            alt="Loading an exercise"
                            src={exExample}
                            width="500"
                            height="300"
                        />
                    </div>
                    <div className="help-card help-card--medium">
                        <h3>Load the score + audio</h3>
                        <p>
                            After selecting an exercise, the score and audio player appear together. Assume the audio is always
                            correct.
                        </p>
                    </div>
                    <div className="help-card help-card--medium">
                        <h3>Feel the groove first</h3>
                        <p>
                            The audio opens with a short introduction so you can feel the key, tempo, and meter before the
                            excerpt begins.
                        </p>
                    </div>
                </section>

                <section className="help-section help-section--split">
                    <div className="help-image">
                        <img
                            alt="Clicking notes to mark errors"
                            src={click}
                            width="500"
                            height="300"
                        />
                    </div>
                    <div className="help-card help-card--medium">
                        <h3>Mark what you hear</h3>
                        <p>
                            Click notes where you hear something <strong>different</strong> than what is written.
                        </p>
                    </div>
                    <div className="help-card help-card--medium">
                        <h3>Cycle through error types</h3>
                        <p>
                            Click a note multiple times to cycle through the different <strong>error types</strong>.
                        </p>
                    </div>
                </section>

                <section className="help-section help-section--split">
                    <div className="help-card help-card--wide">
                        <h3>Use the color key</h3>
                        <p>
                            A <strong>color key</strong> appears with every exercise so you never need to guess which shade
                            represents a rhythm, pitch, or intonation issue.
                        </p>
                    </div>
                    <div className="help-image">
                        <img
                            alt="Error color key"
                            src={noteKey}
                            width="250"
                            height="125"
                        />
                    </div>
                </section>

                <section className="help-section help-section--split">
                    <div className="help-card help-card--wide">
                        <h3>Check answers with confidence</h3>
                        <p>
                            When you are ready, click <strong>Check Answers</strong>. An <strong>error highlight</strong> shows
                            measures that still have mistakes, while a <strong>hint highlight</strong> nudges you toward the
                            correct note. Written feedback accompanies each incorrect selection.
                        </p>
                    </div>
                    <div className="help-image">
                        <img
                            alt="Check Answers feedback"
                            src={check}
                            width="500"
                            height="300"
                        />
                    </div>
                </section>

                <section className="help-section help-section--admin">
                    <h3>Administrator Access</h3>
                    <p>Staff can log in below to unlock the Exercise Management tools.</p>
                    <div className="help-login">
                        <input id="mng-email" placeholder="Enter admin email..." />
                        <input id="mng-pwd" placeholder="Enter admin password..." type="password" />
                        <button onClick={checkAuth}>Submit</button>
                    </div>
                    {error ? <div className="help-error">Incorrect password.</div> : <></>}
                    {authorized ? (
                        <div className="help-card help-card--wide">
                            <h5>Exercise Management Overview</h5>
                            <p>
                                Use the management page to add new exercises, view existing ones, and (when enabled) edit or
                                delete outdated material. Choose <strong>New Exercise</strong> to open a template where you
                                can set tags, difficulty, meter, and textural factors, then upload both the
                                <code>.musicxml</code> score and matching <code>.mp3</code>.
                            </p>
                            <p>
                                The title updates automatically as you adjust options. After the score loads, click notes to
                                mark correct answers, optionally adding note-specific feedback. Use <strong>Update
                                Answers</strong> to finalize selections, <strong>Reset Answers</strong> to clear everything,
                                and <strong>Save</strong> to publish to the database.
                            </p>
                            <p>
                                Saved exercises appear immediately on the Exercises page for students. Report any bugs to
                                Dr. Duker or the Outclassed Dev Team.
                            </p>
                        </div>
                    ) : (
                        <></>
                    )}
                </section>
            </div>
        </div>
    );
}
