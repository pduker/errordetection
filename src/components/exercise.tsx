import React, { HTMLInputTypeAttribute, useState } from 'react';
import  abcjs from 'abcjs';
import FileUpload  from './fileupload';
import ExerciseData from '../interfaces/exerciseData';
import AudioHandler from './audiohandler';
import { Button } from 'react-bootstrap';
import { string } from 'yargs';


export function Exercise({
    exIndex, 
    teacherMode,
    files,
    setFiles,
    setAllExData,
    allExData
}: { 
    exIndex: number;
    teacherMode: boolean;
    files:File[];
    setFiles:((newFile: File[]) => void);
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
}) {
    //for score styling
    const score = {display: "inline-block", margin: "auto", backgroundColor: "white", borderRadius: "2px", width: "400px"};

    var abc = "", feed = "", color: string;
    var ans: any[] = [];
    var visualObjs: any;
    var exerciseData = allExData[exIndex];
    var exInd = exIndex;
    var title = "";
    var tagsV: string[] = [];
    var difficulty = 0;
    if(exerciseData !== undefined) {
       
        if(exerciseData.score !== undefined) abc = exerciseData.score;
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
        if(!(noteElems.getAttribute("selectedTimes"))) {
            noteElems.setAttribute("selectedTimes", 0);
        }
        if(!(noteElems.getAttribute("index"))) {
            noteElems.setAttribute("index", op);
        }
        
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
        console.log(note);
        setLastClicked(note);
        var txt = document.getElementById("note-feedback");
        if (txt !== null && "value" in txt) txt.value = noteElems.getAttribute("feedback");
        setUpdated(false);
        setChecking(false);
    }
    
    const loadScore = function() {
        // sample file: "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3"
        var abcString = abcFile;
        var el = document.getElementById("target" + exIndex);
        if(el !== null && abcString !== undefined){
            visualObjs = abcjs.renderAbc(el,abcString,{ clickListener: clickListener, selectTypes: ["note"],lineThickness: 0.4, responsive: "resize"});
        
            // adds staff #, measure #, and empty feedback to each note when the score is first loaded
            var staffArray = visualObjs[0].lines[0].staff;
            
            for (let j = 0, staff = 0, measure = 0; staff < staffArray.length; j++) {
                var noteElems = staffArray[staff].voices[0][j].abselem.elemset[0];
                if(!(noteElems.getAttribute("staffPos"))) noteElems.setAttribute("staffPos", staff);
                if(!(noteElems.getAttribute("measurePos"))) noteElems.setAttribute("measurePos", measure);
                if(!(noteElems.getAttribute("feedback"))) noteElems.setAttribute("feedback", "");
                if(staffArray[staff].voices[0][j].el_type === "bar") measure++;
                if(j + 1 == staffArray[staff].voices[0].length) {
                    staff++;
                    j = -1;
                    measure = 0;
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
    }

    //runs when save button is pushed on mng view: overwrites exercise data at current index with updated choices
    const save = function(){
        if(abcFile !== undefined && abcFile !== "" && correctAnswers.length > 0) {
            setCorrectAnswers(correctAnswers.sort((i1, i2) => {
                if ((i1.index as number) > (i2.index as number)) return 1;
                if ((i1.index as number) < (i2.index as number)) return -1;
                return 0;
            }));
            let data = new ExerciseData(abcFile, correctAnswers, "", exInd, false,customTitle,diff,tags);
            if(!allExData[exInd]) setAllExData([...allExData,data]);
            else {
                allExData[exInd] = data;
                setAllExData(allExData);
            }
        }  
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
        var feedBox = document.getElementById("note-feedback");
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
    const diffChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        setDiff(Number(e.target.value));
    }

    //onClick function for tags change
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if(tags.includes(val)) {
            tags.splice(tags.indexOf(val), 1);
            setTags([...tags]);
        } else {
            setTags([...tags, val]);
        }
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
            {teacherMode ?
            <span>
                <form id="difficulty">
                    Difficulty:
                    <br></br>
                    <input type="radio" name="difficulty" value="1" checked={diff===1} onChange={diffChange}/>1
                    <input type="radio" name="difficulty" value="2" checked={diff===2} onChange={diffChange}/>2
                    <input type="radio" name="difficulty" value="3" checked={diff===3} onChange={diffChange}/>3
                </form>
                <form id= "tags">
                    Tags:
                    <br></br>
                    <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange}/>Pitch
                    <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange}/>Intonation
                    <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange}/>Rhythm

                </form>
                
                <FileUpload setFiles={setFiles} files={files} setAbcFile={setAbcFile}></FileUpload>
                {(exerciseData !== undefined && !exerciseData.empty && !loaded) || (abcFile !== undefined && abcFile !== "" && !loaded) ? <button onClick={loadScore}>Load Score</button> : <></>}
                <div style = {{width:"70%"}}>
                    <div id={"target" + exIndex} style={score}></div>
                </div>
                
                {(abcFile !== undefined && abcFile !== "" && loaded) || (exerciseData !== undefined && !exerciseData.empty) ? 
                <div style={{display: "inline-block", marginLeft:"1vw"}}>
                    <textarea id="note-feedback" placeholder={"Note feedback..."} onChange={saveFeedback}></textarea>
                </div>:
                <></>}
                {/* <div className="clicked-info"></div> */}
                {selNotes.length >= 1 ? <div>Analysis: {ana}</div> : <div/>}
                {(abcFile !== undefined && abcFile !== "" && loaded) || (exerciseData !== undefined && !exerciseData.empty) ? <div> 
                    <button onClick={multiAnswer}>Update Answers</button>
                    {updated ? <div>Answers updated.</div> : <div/>}
                    <Button variant='danger' onClick={reload}>Reset Answers</Button>
                    <div/>
                    <button onClick={save}>Save</button>
                </div> : <div/>}
            </span>
            :
            <span>
                <div style={{marginLeft: "2px", marginRight: "2px"}}>Difficulty: {diff}</div>
                <div style={{marginLeft: "2px", marginRight: "2px"}}>Tags: {tags.join(", ")}</div>
                {(abcFile !== undefined && abcFile !== "" && !loaded) ? <button onClick={loadScore}>Load Score</button> : <div/>}
                <div style = {{width:"70%"}}>
                    <div id={"target" + exIndex} style={score}></div>
                </div>
                {/* <div className="clicked-info"></div> */}
                {files.some((element) => element.name.endsWith(".mp3")) ? <AudioHandler files={files}></AudioHandler> : <></>}
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