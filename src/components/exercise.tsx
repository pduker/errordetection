import React, { useState } from 'react';
import  abcjs from 'abcjs';
import FileUpload  from './fileupload';
import ExerciseData from '../interfaces/exerciseData';
import AudioHandler from './audiohandler';
import { Button } from 'react-bootstrap';


export function Exercise({ 
    setExerciseData,
    teacherMode,
    exerciseData,
    files,
    setFiles
}: { 
    exerciseData: ExerciseData | undefined;
    setExerciseData: ((newData: ExerciseData) => void);
    teacherMode: boolean;
    files:File[];
    setFiles:((newFile: File[]) => void);
}) {
    var abc = "", feed = "", color: string;
    var ans = {};
    var visualObjs: any;

    if(exerciseData !== undefined) {
        if(exerciseData.score !== undefined) abc = exerciseData.score;
        if(exerciseData.correctAnswers !== undefined) ans = exerciseData.correctAnswers;
        if(exerciseData.feedback !== undefined) feed = exerciseData.feedback;
    }

    const [updated, setUpdated] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [ana, setAna] = useState<string>(); 

    const [selNotes,setSelNotes] = useState<any[]>([]);
    const [selAnswers, setSelAnswers] = useState<any[]>([]);
    const [correctAnswers, setCorrectAnswers] = useState<{[index: number]: {[label: string]: number}}>(ans);
    //const [correctAnswers, setCorrectAnswers] = useState<string>(ans);
    
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
            for (var i=0; i<selAnswers.length; i++) {
                if(selAnswers[i] === note) {
                    if(highlight(selAnswers[i], undefined, true) === 1) i--;
                } else {
                    if(highlight(selAnswers[i], undefined, false) === 1) i--;
                }
            }
            setSelAnswers([...selAnswers]);
        }
        /* var test = document.querySelector(".clicked-info");
        if(test !== null) {test.innerHTML = "<div class='label'>Clicked info:</div>" + op;} */
        var staffCt = (Number(noteElems.getAttribute("staffPos"))) + 1, measureCt = (Number(noteElems.getAttribute("measurePos")) + 1);
        setAna("Note is on staff " + staffCt + " and measure " + measureCt);
        setUpdated(false);
    }
    
    const loadScore = function() {
        // sample file: "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3"
        var abcString = abcFile;
        var el = document.getElementById("target");
        if(el !== null && abcString !== undefined){
            visualObjs = abcjs.renderAbc(el,abcString,{ clickListener: clickListener, selectTypes: ["note"]});
        
            // adds staff # and measure # to each note when the score is first loaded
            var staffArray = visualObjs[0].lines[0].staff;
            
            for (let j = 0, staff = 0, measure = 0; staff < staffArray.length; j++) {
                if(!(staffArray[staff].voices[0][j].abselem.elemset[0].getAttribute("staffPos"))) staffArray[staff].voices[0][j].abselem.elemset[0].setAttribute("staffPos", staff);
                if(!(staffArray[staff].voices[0][j].abselem.elemset[0].getAttribute("measurePos"))) staffArray[staff].voices[0][j].abselem.elemset[0].setAttribute("measurePos", measure);
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

    const reload = function() {
        setSelNotes([]);
        setCorrectAnswers({});
        setUpdated(false);
        setLoaded(true);
    }

    const save = function(){
        if(abcFile !== undefined && abcFile !== "" && correctAnswers !== undefined ){
            let data = new ExerciseData(abcFile, correctAnswers, "");
            setExerciseData(data);
        }  
    }
    const multiAnswer = function(){
        
        const dict: {[index: number]: {[label: string]: number}} = {};
        for(let i = 0;i < selNotes.length;i++){
            var noteElems = selNotes[i].abselem.elemset[0];
            const dict2:{[label: string]: number} ={
                "staffPos": noteElems.getAttribute("staffPos"),
                "measurePos": noteElems.getAttribute("measurePos"),
                "selectedTimes": noteElems.getAttribute("selectedTimes")
            }
            dict[noteElems.getAttribute("index")] = dict2;
        }
        setCorrectAnswers(dict);
        setUpdated(true);
    }
    const log = function(){
        console.log(selAnswers);
        console.log(correctAnswers);
    }

    const everyFunc = function(element: any, index: number, array: any[]): boolean {
        var ret: boolean = true;
        for (let it = 0; it < array.length && ret; it++) {
            var elems = element.abselem.elemset[0];
            var elemId = elems.getAttribute("index");
            if (correctAnswers[elemId] === undefined) ret = false;
            else if (
                elems.getAttribute("staffPos") !== correctAnswers[elemId]["staffPos"] ||
                elems.getAttribute("measurePos") !== correctAnswers[elemId]["measurePos"] ||
                elems.getAttribute("selectedTimes") !== correctAnswers[elemId]["selectedTimes"]
            ) ret = false;
        }
        return ret;
    }

    const debug = function() {
        console.log("loaded? " + loaded);
        console.log("exercise data? V");
        console.log(exerciseData);
    }

    return (
        <div>
            <button onClick={debug}>bebug bubbon</button>
            {teacherMode===true?
            <span>
                <FileUpload setFiles={setFiles} files={files} setAbcFile={setAbcFile}></FileUpload>
                {(exerciseData !== undefined) || (abcFile !== undefined && abcFile !== "" && !loaded) ? <button onClick={loadScore}>Load Score</button> : <></>}
                <div id ="target"></div>
                {/* <div className="clicked-info"></div> */}
                {selNotes.length >= 1 ? <div>Analysis: {ana}</div> : <div/>}
                {(abcFile !== undefined && abcFile !== "" && loaded) || (exerciseData !== undefined) ? <div> 
                    <button onClick={multiAnswer}>Update Answers</button>
                    {updated ? <div>Answers updated.</div> : <div/>}
                    <Button variant='danger' onClick={reload}>Reset Answers</Button>
                    <div/>
                    <button onClick={save}>Save</button>
                </div> : <div/>}
                {/* <div>Currently selected answer:</div>

                {correctAnswers !== undefined ?
                <ul>
                    {correctAnswers.map(function(answer) {
                        return (
                            <li key={answer.abselem.elemset[0].getAttribute("data-index")}>{answer.abselem.elemset[0].getAttribute("data-index")}</li>
                        )
                    })}
                </ul>:
                <div></div>
                } */}
                
                
                
            </span>
            :
            <span>
            {(abcFile !== undefined && abcFile !== "" && !loaded) ? <button onClick={loadScore}>Load Score</button> : <div/>}
            <div id ="target"></div>
            {/* <div className="clicked-info"></div> */}
            {files.some((element) => element.name.endsWith(".mp3")) ? <AudioHandler files={files}></AudioHandler> : <></>}
            {selAnswers.length >= 1 ? <div>Analysis: {ana}</div> : <div/>}
            {(abcFile !== undefined && abcFile !== "" && loaded) ? 
                <div>
                    <button onClick={log}>Check Answer</button>
                    {selAnswers.length >= 1 ? (
                        selAnswers.length === Object.keys(correctAnswers).length ? (
                            selAnswers.every(everyFunc) ? 
                                <div>Correct!</div>
                                :
                                <div>Incorrect </div>) : 
                            <div>Incorrect</div>) :
                        <div>Select an Answer</div>
                    }
                </div>
                : <div/>}
            </span>
            }
            
        </div>

    );
}