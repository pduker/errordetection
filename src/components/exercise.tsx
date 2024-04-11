import React, { useState } from 'react';
import { ref, push, onValue, DataSnapshot, get, remove } from 'firebase/database';
import  abcjs from 'abcjs';
import FileUpload  from './fileupload';
import ExerciseData from '../interfaces/exerciseData';
import DBData from '../interfaces/DBData';
import AudioHandler from './audiohandler';
import { getDatabase } from 'firebase/database';
import { Button } from 'react-bootstrap';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot, StorageReference, uploadBytes } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { stringify } from 'querystring';

const firebaseConfig = {
    apiKey: "AIzaSyClKDKGi72jLfbtgWF1957XHWZghwSM0YI",
    authDomain: "errordetectinator.firebaseapp.com",
    databaseURL: "https://errordetectinator-default-rtdb.firebaseio.com",
    projectId: "errordetectinator",
    storageBucket: "errordetectinator.appspot.com",
    messagingSenderId: "442966541608",
    appId: "1:442966541608:web:b08d5b8a9ea1d5ba2ffc1d"
};
const app = initializeApp(firebaseConfig);

// Export initialized Firebase app
export const firebaseApp = app; 

export function Exercise({
    exIndex, 
    teacherMode,
    allExData,
    setAllExData,
    ExData
}: { 
    exIndex: number;
    teacherMode: boolean;
    ExData: ExerciseData;
    allExData: (ExerciseData | undefined)[]
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
}) {
    //for score styling
    const score = {display: "inline-block", margin: "auto", backgroundColor: "white", borderRadius: "2px", width: "400px"};

    var abc = "", feed = "", color: string;
    var ans: any[] = [];
    var visualObjs: any;
    var exerciseData = ExData;
    var exInd = exIndex;
    var title = "";
    var tagsV: string[] = [];
    var difficulty = 1;
    var mp3: File = new File([], "");

    if(exerciseData !== undefined) {
       
        if(exerciseData.score !== undefined) abc = exerciseData.score;
        if(exerciseData.sound !== undefined) mp3 = exerciseData.sound;
        if(exerciseData.correctAnswers !== undefined) ans = exerciseData.correctAnswers;
        if(exerciseData.feedback !== undefined) feed = exerciseData.feedback;
        if(exerciseData.title !== undefined) title = exerciseData.title;
        if(exerciseData.tags !== undefined) tagsV = exerciseData.tags;
        if(exerciseData.difficulty !== undefined) difficulty = exerciseData.difficulty;
        
    }

    const [updated, setUpdated] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [checking, setChecking] = useState<boolean>(false);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [ana, setAna] = useState<string>(); 
    const [customTitle, setCustomTitle] = useState<string>(title);
    const [diff, setDiff] = useState<number>(difficulty);
    const [tags, setTags] = useState<string[]>(tagsV);
    const [customFeedback, setCustomFeedback] = useState<string[]>([]);
    const [lastClicked, setLastClicked] = useState<any>();

    const [selNotes,setSelNotes] = useState<any[]>([]);
    const [selAnswers, setSelAnswers] = useState<any[]>([]);
    const [correctAnswers, setCorrectAnswers] = useState<{[label: string]: (number | string)}[]>(ans);
    const [xmlFile, setXmlFile] = useState<File>();
    const [mp3File, setMp3File] = useState<File>(mp3);
    
    const [abcFile, setAbcFile] = useState<string>(abc);
    
    //yoinked/edited from abcjs! probably don't need all of it for highlighting but oh well
    const setClass = function (elemset: any, addClass: any, removeClass: any, color: any) {
        if (!elemset)
            return;
        for (var i = 0; i < elemset.length; i++) {
            var el = elemset[i];
            var attr = el.getAttribute("highlight");
            if (!attr) attr = "fill";
            el.setAttribute(attr, color);
            var kls = el.getAttribute("class");
            if (!kls) kls = "";
            kls = kls.replace(removeClass, "");
            kls = kls.replace(addClass, "");
            if (addClass.length > 0) {
                if (kls.length > 0 && kls[kls.length - 1] !== ' ') kls += " ";
                kls += addClass;
            }
            el.setAttribute("class", kls);
        }
    };

    //yoinked/edited from abcjs! changed behavior so it works how we want it to B)
    const highlight = function (note: any, klass: any, clicked: boolean): number {
        var retval = 0;
        var selTim = note.abselem.elemset[0].getAttribute("selectedTimes");
        if (clicked) selTim++;
        if (selTim >= 4) {
            selTim = 0;
            selNotes.splice(selNotes.indexOf(note),1);
            selAnswers.splice(selAnswers.indexOf(note),1)
            retval = 1;
        }
        if (klass === undefined)
            klass = "abcjs-note_selected";
        if (selTim <= 0) {
            color = "#000000";
        }
        if (selTim == 1) {
            color = "#ff6100"; //was red - ff0000, now orange - ff6100
        }
        if (selTim == 2) {
            color = "#dc267f"; //was blue - 00ff00, now magenta - dc267f
        }
        if (selTim == 3) {
            color = "#648fff"; //was green - 0000ff, now blue - 648fff
        }
        if (clicked) note.abselem.elemset[0].setAttribute("selectedTimes", selTim);
        setClass(note.abselem.elemset, klass, "", color);
        return retval;
        
    };

    //handles notes when they are clicked on: selects them and highlights them
    const clickListener = function (abcelem:any, tuneNumber: number, classes:string, analysis:abcjs.ClickListenerAnalysis, drag:abcjs.ClickListenerDrag){
        var op = JSON.stringify(drag.index);
        //setOutput(op);
        var note = abcelem;
        var noteElems = note.abselem.elemset[0];
        //selected notes handling
        if(teacherMode){
            if(!selNotes.includes(note)) {
                selNotes[selNotes.length] = note;
            }
            for (var i=0; i<selNotes.length; i++) {
                if(selNotes[i] === note) {
                    if(highlight(selNotes[i], undefined, true) === 1) i--;
                } else {
                    if(highlight(selNotes[i], undefined, false) === 1) i--;
                }
            }
            setSelNotes([...selNotes]);
        }
        else{
            if(!selAnswers.includes(note)) {
                selAnswers[selAnswers.length] = note;
            }
            for (var j=0; j<selAnswers.length; j++) {
                if(selAnswers[j] === note) {
                    if(highlight(selAnswers[j], undefined, true) === 1) j--;
                } else {
                    if(highlight(selAnswers[j], undefined, false) === 1) j--;
                }
            }
            setSelAnswers([...selAnswers]);
        }
        /* var test = document.querySelector(".clicked-info");
        if(test !== null) {test.innerHTML = "<div class='label'>Clicked info:</div>" + op;} */
        var staffCt = (Number(noteElems.getAttribute("staffPos"))) + 1, measureCt = (Number(noteElems.getAttribute("measurePos")) + 1);
        setAna("Note is on staff " + staffCt + " and measure " + measureCt);
        console.log(selNotes);//noteElems.getAttribute("index")
        setLastClicked(note);
        var txt = document.getElementById("note-feedback-"+exIndex);
        if (txt !== null && "value" in txt) txt.value = noteElems.getAttribute("feedback");
        setUpdated(false);
        setChecking(false);
    }
    
    const loadScore = function() {
        // sample file: "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3"
        var abcString = abcFile;
        abcString = abcString.replace("Z:Copyright ©\n", "");
        var el = document.getElementById("target" + exIndex);
        if(el !== null && abcString !== undefined){
            visualObjs = abcjs.renderAbc(el,abcString,{ clickListener: clickListener, selectTypes: ["note"],lineThickness: 0.4, responsive: "resize"});
            console.log(correctAnswers);
            // adds staff #, measure #, and empty feedback to each note when the score is first loaded
            var staffArray = visualObjs[0].lines[0].staff;
            
            for (let i = 0, j = 0, staff = 0, measure = 0; staff < staffArray.length; i++, j++) {
                var note = staffArray[staff].voices[0][j];
                var noteElems = staffArray[staff].voices[0][j].abselem.elemset[0];
                if(!(noteElems.getAttribute("staffPos"))) noteElems.setAttribute("staffPos", staff);
                if(!(noteElems.getAttribute("measurePos"))) noteElems.setAttribute("measurePos", measure);
                if(!(noteElems.getAttribute("feedback"))) noteElems.setAttribute("feedback", "");
                if(!(noteElems.getAttribute("index"))) noteElems.setAttribute("index", i);
                if(!(noteElems.getAttribute("selectedTimes"))) noteElems.setAttribute("selectedTimes", 0);
                if(note.el_type === "bar") {measure++; i--;}
                if(j + 1 == staffArray[staff].voices[0].length) {
                    staff++;
                    j = -1;
                    measure = 0;
                }
                if(teacherMode) {
                    var ansSearch = correctAnswers.findIndex((answer: {[label: string]: string | number}) => (answer.index === noteElems.getAttribute("index") && note.el_type !== "bar"))
                    if(ansSearch !== -1) {
                        noteElems.setAttribute("selectedTimes", correctAnswers[ansSearch].selectedTimes);
                        noteElems.setAttribute("feedback", correctAnswers[ansSearch].feedback);
                        
                        if(!selNotes.includes(note)) {
                            selNotes[selNotes.length] = note;
                        }
                        setSelNotes([...selNotes]);
                        if(!selAnswers.includes(note)) {
                            selAnswers[selAnswers.length] = note;
                        }
                        setSelAnswers([...selAnswers]);
                        for(let q = 0; q < noteElems.getAttribute("selectedTimes"); q++)
                            highlight(note, undefined, false);
                    }
                }
            }
            setLoaded(true);
        } else {
            console.log("abcString is undefined");
        }
    }

    //runs when reset answers button is pushed on mng view: essentially reloads score/resets answers
    const reload = function() {
        setSelNotes([]);
        setCorrectAnswers([]);
        setUpdated(false);
        setLoaded(true);
        loadScore();
    }

    

    //runs when save button is pushed on mng view: overwrites exercise data at current index with updated choices
    const save = async function(){
        var data;
        if(correctAnswers.length > 0) {
            setCorrectAnswers(correctAnswers.sort((i1, i2) => {
                if ((i1.index as number) > (i2.index as number)) return 1;
                if ((i1.index as number) < (i2.index as number)) return -1;
                return 0;
            }));
        } 
        if (abcFile !== undefined && abcFile !== "") {
            data = new ExerciseData(abcFile, mp3File, correctAnswers, "", exInd, false,customTitle,diff,tags);
        } else {
            
        }
        //setExerciseData(data);
    
        // Get database reference
        const database = getDatabase();
        const storage = getStorage();

        // Save data to database
        const scoresRef = ref(database, 'scores');
        const audioref = storageRef(storage, mp3File.name);
        uploadBytes(audioref, mp3File).then((snapshot) => {
            console.log('Uploaded a blob or file!');
          });
        var dbdata = new DBData(data, mp3File.name);
        await push(scoresRef, dbdata); // Use push to add new data without overwriting existing data
        console.log('Score saved successfully!');
        console.log(dbdata);
            /*if(!ExData) setAllExData([...ExData,data]);
            else {
                ExData = data;
                setAllExData(allExData);
            }*/
        }  

    //runs when update answers button is pushed on mng view: creates nested dictionaries with necessary selected answer info
    const multiAnswer = function(){
        
        const dict: {[label: string]: number}[] = [];
        for(let i = 0;i < selNotes.length;i++){
            var noteElems = selNotes[i].abselem.elemset[0];
            const dict2:{[label: string]: number} ={
                "index": noteElems.getAttribute("index"),
                "staffPos": noteElems.getAttribute("staffPos"),
                "measurePos": noteElems.getAttribute("measurePos"),
                "selectedTimes": noteElems.getAttribute("selectedTimes"),
                "feedback": noteElems.getAttribute("feedback")
            }
            dict[i] = dict2;
        }
        /* dict.sort((i1, i2) => {
            if ((i1.index as number) > (i2.index as number)) return 1;
            if ((i1.index as number) < (i2.index as number)) return -1;
            return 0;
        }) */
        console.log(dict);
        setCorrectAnswers(dict);
        setUpdated(true);
    }

    //runs when check answers button is pushed on ex view: logs selected and correct answers for debug and toggles feedback to appear
    const log = function(){
        console.log(selAnswers);
        console.log(correctAnswers);
        setCustomFeedback([]);
        setChecking(true);
    }

    //runs when save note feedback button is pushed on mng view: saves individual note feedback into the selected note
    const saveFeedback = function(e: React.ChangeEvent<HTMLTextAreaElement>) {
        var feedBox = document.getElementById("note-feedback-"+exIndex);
        if(feedBox !== null && "value" in feedBox) {
            var str = feedBox.value as string;
            lastClicked.abselem.elemset[0].setAttribute("feedback", str);
        }
    }

    //saveFeedback, but with the exercise title
    const saveTitle = function() {
        var titleBox = document.getElementById("title");
        if(titleBox !== null && "value" in titleBox) {
            var str = titleBox.value as string;
            setCustomTitle(str);
            setEditingTitle(!editingTitle);
        }
    }

    //onClick function for difficulty change
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff(Number(e.target.value));
        setCustomTitle(tags.sort().join(" & ") + ": Level " + Number(e.target.value)+ ", Exercise: " + findNum(tags, Number(e.target.value)));
    }

    //onClick function for tags change
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if(tags.includes(val)) {
            tags.splice(tags.indexOf(val), 1);
            setTags([...tags]);
            setCustomTitle([...tags].sort().join(" & ") + ": Level " + diff + ", Exercise: "+ findNum([...tags],diff));
        } else {
            setTags([...tags, val]);
            setCustomTitle([...tags,val].sort().join(" & ") + ": Level " + diff + ", Exercise: " + findNum([...tags,val],diff));
        }
        
    }
    const findNum = function(tags:string[],difficulty:number):number{
        
        const count = allExData.filter((exData:ExerciseData | undefined)=> {if (exData !== undefined && exData.tags !== undefined && exData.difficulty !== undefined){return exData.tags.sort().toString() === tags.sort().toString() && exData.difficulty === difficulty}});
        return count.length+1;

    }

    //function for comparing selected answers to correct answers
    const everyFunc = function(element: any, index: number, array: any[]): boolean {
        var ret: boolean = true;
        var feedback: string[] = [];
        if(array.length !== correctAnswers.length) {
            ret = false;
            var plural = " are ";
            if (correctAnswers.length === 1) plural = " is ";
            feedback = ([...feedback, 
                "You selected " + selAnswers.length + " answer(s). There" + plural + correctAnswers.length + " correct answer(s)."]);
        }
        array.sort((i1, i2) => {
            if ((i1.abselem.elemset[0].getAttribute("index") as number) > (i2.abselem.elemset[0].getAttribute("index") as number)) return 1;
            if ((i1.abselem.elemset[0].getAttribute("index") as number) < (i2.abselem.elemset[0].getAttribute("index") as number)) return -1;
            return 0;
        })
        
        var elems = element.abselem.elemset[0];
        if (correctAnswers[index] === undefined || elems.getAttribute("index") !== correctAnswers[index]["index"]) {
            ret = false;
            feedback = ([...feedback, 
                "Wrong answer selected on measure " + (Number(elems.getAttribute("measurePos"))+1) + " of staff " + (Number(elems.getAttribute("staffPos"))+1) + "."]);
        }
        else if (
            (elems.getAttribute("staffPos") !== correctAnswers[index]["staffPos"]) ||
            (elems.getAttribute("measurePos") !== correctAnswers[index]["measurePos"]) ||
            (elems.getAttribute("selectedTimes") !== correctAnswers[index]["selectedTimes"]) 
        ) {
            ret = false;
        }
        
        if (!ret) 
            for(let q=0; q<correctAnswers.length; q++) {
                feedback = ([...feedback, "Look in measure " + (Number(correctAnswers[q]["measurePos"])+1) + " of staff " + (Number(correctAnswers[q]["measurePos"])+1) + ": " + correctAnswers[q]["feedback"] as string]);
            }
        else feedback = ["Correct!"];
        setCustomFeedback([...feedback]);
        setChecking(false);
        return ret;
    }
    //function used with bebug bubbon for testing
    /* const debug = function() {
        console.log("loaded? " + loaded);
        console.log("exercise data? V");
        console.log(exerciseData);
    } */

    const arrayEquals = (a: any[], b: any[]): boolean => {
        if (a.length !== b.length) return false;
    
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
    
        return true;
    };

    //deleting the exercise from database and website
    const handleExerciseDelete = async (exIndex: number, tags: string[]) => {
        try {
            //get database reference
            const database = getDatabase();
    
            //find the exercise based on matching exIndex and tags
            const exerciseRef = ref(database, 'scores');
            const snapshot = await get(exerciseRef);
            if (snapshot.exists()) {
                const exercises = snapshot.val();
    
                //iterate through each exercise
                for (const key in exercises) {
                    if (exercises.hasOwnProperty(key)) {
                        const exercise = exercises[key];
    
                        //check if exercise match both exIndex and tags
                        if (exercise.exIndex === exIndex && arrayEquals(exercise.tags, tags)) {
                            // removing exercise from the database
                            const exerciseDataRef = ref(database, `scores/${key}`);
                            await remove(exerciseDataRef);
                            console.log('Exercise deleted successfully!');
                            
                        //removing exercise from the page
                        const updatedExercises = allExData.filter((exercise: any) => {
                            return exercise.exIndex !== exIndex || !exercise.tags.every((tag: string) => tags.includes(tag));
                        });
                        setAllExData(updatedExercises);
    
                        return;
                        }
                    }
                }
    
                //if no matching exercise is found
                console.log('Exercise with exIndex ' + exIndex + ' and tags ' + tags.join(', ') + ' not found!');
            }
        } catch (error) {
            console.error('Error deleting exercise:', error);
        }
    };

    return (
        <div style = {{margin: "10px", padding: "10px", backgroundColor: "#fcfcd2", borderRadius: "10px"}}>
            {/* <button onClick={debug}>bebug bubbon</button> */}
            {editingTitle && teacherMode ? 
                <span>
                    <textarea id="title">{customTitle}</textarea> 
                    <button onClick={saveTitle}>Save Title</button>
                </span>
                : 
                <h3 onClick={()=>setEditingTitle(!editingTitle)}>{customTitle}</h3>
            }
            {/* <h4>Global Index: {exIndex}</h4> */}
            {teacherMode ?
            <span>
                <form id= "tags">
                    Tags:
                    <br></br>
                    <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange}/>Rhythm
                    <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange}/>Intonation
                    <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange}/>Pitch
                    
                    
                </form>
                <form id="difficulty">
                    Difficulty:
                    <br></br>
                    <select name="difficulty" onChange={diffChange}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </form>
                
                <div id="fileUploads" style={{display:"inline",float:"left"}}>
                    XML Upload: <FileUpload setFile={setXmlFile} file={xmlFile} setAbcFile={setAbcFile} type="xml"></FileUpload>
                </div>
                <div id="mp3Upload" style={{display:"inline"}}>
                    MP3 Upload: <FileUpload setFile={setMp3File} file={mp3File} setAbcFile={setAbcFile} type="mp3"></FileUpload>
                </div>
                
                {mp3 === undefined ? <br></br> : <></>}
                {(exerciseData !== undefined && !exerciseData.empty && !loaded) || (abcFile !== undefined && abcFile !== "" && !loaded) ? <button onClick={loadScore}>Load Score</button> : <></>}
                <div style = {{width:"70%"}}>
                    <div id={"target" + exIndex} style={score}></div>
                </div>
                
                {(abcFile !== undefined && abcFile !== "" && loaded) || (exerciseData !== undefined && !exerciseData.empty) ? 
                <div style={{display: "inline-block", marginLeft:"1vw"}}>
                    <textarea id={"note-feedback-"+exIndex} placeholder={"Note feedback..."} onChange={saveFeedback}></textarea>
                </div>:
                <></>}
                {/* <div className="clicked-info"></div> */}
                {selNotes.length >= 1 ? <div>Analysis: {ana}</div> : <div/>}
                {(abcFile !== undefined && abcFile !== "" && loaded) || (exerciseData !== undefined && !exerciseData.empty) ? <div> 
                    <button onClick={multiAnswer}>Update Answers</button>
                    <Button variant='danger' onClick={reload}>Reset Answers</Button>
                    <Button onClick={() => handleExerciseDelete(exIndex, tags)} variant="danger">Delete</Button>
                    {updated ? <div>Answers updated.</div> : <></>}
                </div> : <div/>}
                {updated || (mp3File.name !== "") ? <button onClick={save}>Save</button> : <></>}
            </span>
            :
            <span>
                {/* <div style={{marginLeft: "2px", marginRight: "2px"}}>Difficulty: {diff}</div>
                <div style={{marginLeft: "2px", marginRight: "2px"}}>Tags: {tags.join(", ")}</div> */}
                {(abcFile !== undefined && abcFile !== "" && !loaded) ? <button onClick={loadScore}>Load Score</button> : <div/>}
                <div style = {{width:"70%"}}>
                    <div id={"target" + exIndex} style={score}></div>
                </div>
                {/* <div className="clicked-info"></div> */}
                {mp3 !== undefined ? <AudioHandler file={mp3}></AudioHandler> : <></>}
                {/* selAnswers.length >= 1 ? <div>Analysis: {ana}</div> : <div/> */}
                {(abcFile !== undefined && abcFile !== "" && loaded) ? 
                    <div>
                        <button onClick={log}>Check Answer</button>
                        {checking ? (
                            selAnswers.length > 0 ? (
                                selAnswers.every(everyFunc) ? (
                                    <></>
                                ) : <></>
                            ) : <></>
                        ) : <></>
                        }
                        <div>Next step(s): {customFeedback.map(function(feedback) {
                            return <li key={feedback}>{feedback}</li>
                        })}</div>
                    </div>
                : <div/>}
            </span>
            }
            
        </div>

    );
}
