//imports
import { useState } from "react";
import { sha256 } from 'js-sha256';
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
        <div>
            <h2 style={{textAlign: "center"}}>Welcome to the Help Page!</h2>
            <div style={{textAlign: "left", margin: "10px", padding: "10px", backgroundColor: "#fcfcd2", borderRadius: "10px"}}>
                <div style={{textAlign: "center", margin: "10px auto", padding: "25px", backgroundColor: "white", borderRadius: "10px", width: "1000px"}}>
                    This site is meant to help you practice your <strong>error detection skills</strong>. You will have the chance to pracitce on a variety of <strong>exercises</strong>. On each you will the <strong>read a music score</strong> attached to the exercise. 
                    Attached to the exercise is also the <strong>audio sample</strong> of the music. This sample should match the score,
                    however in each exercise there is <strong>at least one incorrect note</strong>. Students will be able to develop their error detection skills more by working to identify
                    the error.<br/>
                </div>
                <div style={{ display: "flex", justifyContent: "center" , backgroundColor: "#8ecbe1", borderRadius: "10px"}}>
                    <div style={{textAlign: "center", margin: "10px", padding: "20px", backgroundColor: "white", borderRadius: "10px", width: "200px", height: "150px", marginTop: "75px"}}>
                        On the <strong>Exercises page</strong>, you’ll find a list of the exercises currently uploaded to the site. <br/>
                    </div>
                    <div style={{textAlign: "center", margin: "10px", marginRight: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", marginTop: "75px", width: "200px", height: "150px"}}>
                        On this page we can view <strong>all exercises</strong> that are stored in our database. <br/>
                    </div>
                    <div>
                        <img
                            alt="exc-page"
                            src={execPage}
                            width="500"
                            height="300"
                        />
                    </div>

                </div>

                <div style={{ display: "flex", justifyContent: "center", margin: "10px auto", borderRadius: "10px", backgroundColor: "#8ecbe1", width: "fit-content"}}>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", borderRadius: "10px", display: "flex", justifyContent: "center"}}>
                        <img 
                            alt="filter"
                            src={filterSec}
                            width = "500"
                            height = "300"
                        />
                    </div>
                    <div style={{textAlign: "center", margin: "10px", padding: "20px", backgroundColor: "white", borderRadius: "10px", width: "300px", height: "200px", marginTop: "45px"}}>
                        You can use the different <strong>filters to sort</strong> and find appropriately challenging exercises for you (e.g. if you are new to this, consider starting with: <i>intonation + 1 voice + level 1 + drone</i>). <br/>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center"}}>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px"}}>
                        Clicking on the <i>“drone”</i> checkbox will find exercises that have a drone on tonic. <br/> <br/>
                    </div>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px"}}>
                        Clicking on the <i>“ensemble parts”</i> checkbox will have multiple voices/instruments performing the same part (e.g., 3 different clarinets playing the top line, one of which will perform the error(s)). <br/>
                    </div>
                </div>
                <div style={{backgroundColor: "#8ecbe1", borderRadius: "10px", display: "flex", justifyContent: "center", margin: "10px"}}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center"}}>
                        <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", width: "300px"}}>
                            After finding some exercises, simply click the exercise to open it! <br/>
                        </div>
                        <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", width: "300px"}}>
                            A short excerpt of a score and an audio player will show up. Assume that the score will always be correct. <br/>
                        </div>
                    </div>
                    <div>
                            <img 
                                alt="exercise"
                                src={exExample}
                                width = "500"
                                height = "300"
                            />
                    </div>
                </div>
                <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px"}}>
                    The Audio file will play a short intro (2 bars long) to let you entrain to the key, tempo, and meter (you can move the cursor to skip past this if you don’t need it). <br/>
                </div>
                <div style={{justifyContent: "center", display: "flex", backgroundColor: "#8ecbe1", borderRadius: "10px", alignItems: "center"}}>
                    <div >
                        <img
                            alt="note click"
                            src={click}
                            width="500"
                            height = "300"
                        />
                    </div>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", width: "300px", height: "150px", alignContent: "center"}}>
                        Your job is to <strong>click</strong> on the notes where you hear something <strong>different</strong> from what is in the score.
                    </div>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", width: "300px", height: "150px", alignContent: "center"}}>
                        Click a note <strong>multiple times</strong> to change which type of error you hear.
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center", backgroundColor: "#8ecbe1", borderRadius: "10px", margin: "10px auto", width: "fit-content"}}>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", width: "400px", alignContent: "center"}}>
                        A <strong>key</strong> will be present on each exercise to remind you which <strong>color</strong> corresponds to which kind of <strong>error</strong>.<br/>
                    </div>
                    <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", display: "flex", justifyContent: "center"}}>          
                        <div>
                            <img
                                alt="note-color-key"
                                src={noteKey}
                                width="250"
                                height="125"
                            />
                        </div>
                    </div>
                </div>
            <div style={{display: "flex", justifyContent: "center", backgroundColor: "#8ecbe1", alignItems: "center", borderRadius: "10px"}}>
                <div style={{textAlign: "center", margin: "10px", padding: "10px", backgroundColor: "white", borderRadius: "10px", width: "500px", height: "175px"}}>
                    After selecting all errors, click <strong>"Check Answers"</strong> to receive feedback on how you did. There will be an <strong>error highlight</strong> to show which meausre has incorrect selections
                    and a <strong>hint highlight</strong> to help you look more closely at the measure that contains the correct error note. There is also <strong>written feedback</strong> for each incorrect note selection.
                </div>
                <div>
                    <img 
                        alt="check answer"
                        src={check}
                        width="500"
                        height="300"
                    />
                </div>
            </div>

            </div>
            <div style={{margin: "6px"}}>
                <input id="mng-email" placeholder="Enter admin email..."></input>
                <span style={{padding: "10px"}}></span>
                <input id="mng-pwd" placeholder="Enter admin password..."></input>
                <span style={{padding: "10px"}}></span>
                <button onClick={checkAuth}>Submit</button>
            </div>
            {error ? <div style={{color: "red"}}>Incorrect password.</div> : <></>}
            {authorized ? <div style={{margin: "10px", padding: "10px", backgroundColor: "#fcfcd2", borderRadius: "10px"}}>
                <h5>Additional admin info: </h5>
                On the Exercise Management page, you can add new exercises, view, edit (under construction currently, do not attempt to edit), and delete previous exercises. <br/>
                To add an exercise, click the "New Exercise" button at the top of the page. <br/>
                This will open a new exercise, with fields to input tags, difficulty, and places to upload a .musicxml and a .mp3 file. <br/>
                The title of the exercise will automatically update as you select tags and difficulty. <br/>
                After uploading a .musicxml file (make sure it's specifically .musicxml!), the score will be loaded in. <br/>
                The .mp3 file will also allow you to preview the sound when you upload it. <br/>
                On the score, select a note to toggle its color, corresponding to the errors as illustrated in the key above. <br/>
                This key will also be included on every exercise for your ease of use. <br/>
                After you select a note, you can add specific feedback pertaining to the note in the feedback box. <br/>
                Once you have selected all the desired answers and entered relevant feedback (if any), click the Update Answers button. <br/>
                This will prepare the exercise for saving and uploading to the database. You can also click Reset Answers to clear the exercise and start from a fresh score. <br/>
                After clicking Update Answers, click Save once you're ready to upload the exercise to the database. <br/>
                If you want to delete an exercise instead, just click the Delete button. <br/>
                Once you've saved an exercise, it will appear on the Exercise page, able to be practiced! <br/>
                <br></br>
                If you come across any bugs, be sure to report them to Dr. Duker or the Outclassed Dev Team. <br/>
            </div> : <></>}
        </div>
    );
}
