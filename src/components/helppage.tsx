import { useState } from "react";
import noteKey from "../assets/note-color-key.png"

export function HelpPage({
    authorized,
    setAuthorized
}: {
    authorized: boolean;
    setAuthorized: ((authorized: boolean) => void);
}) {
    const [error, setError] = useState<boolean>(false);

    const checkAuth = function() {
        var box = document.getElementById("mng-pwd");
        if(box !== null && "value" in box) {
            var str = box.value as string;
            if(str === "ILoveMusic") {
                setAuthorized(true);
                setError(false);
            } else {
                setError(true);
            }
        }
    }

    return (
        <div>
            <h2>Welcome to the Help Page!</h2>
            <div style={{margin: "10px", padding: "10px", backgroundColor: "#fcfcd2", borderRadius: "10px"}}>This site is meant to help students practice their music reading and listening capabilities.<br/>
                On the Exercises page, you'll find a list of all the exercises currently uploaded to the site.<br/>
                You can use the "tags" and "difficulty" fields to sort and find the right exercise.<br/>
                After finding the right one, simply click the exercise to open it!<br/>
                A piece of score and an audio player will show up. The score will always be correct.<br/>
                Your job is to click the notes on the score where you think an error is present in the sound. <br/>
                Click a note multiple times to change which type of error you believe is present.<br/>
                A key will be present on each exercise to remind you which color corresponds to which error.<br/>
                This key is also included here: <br/>
                <div>
                    <img
                    alt="note-color-key"
                    src={noteKey}
                    width="300"
                    height="112"
                    />
                </div>
                After selecting all errors, click "Check Answers" to receive feedback.<br/>
            </div>
            <div style={{margin: "6px"}}>
                <input id="mng-pwd" placeholder="Enter admin password..."></input>
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
