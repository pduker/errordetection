import React, { useState } from 'react';
import  abcjs from 'abcjs';
import FileUpload  from './fileupload';
import ExerciseData from '../interfaces/exerciseData';
import AudioHandler from './audiohandler';


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
    var abc,ans,feed, color: string;
    var visualObjs: any[], visualObj;
    abc = "";
    ans = "";
    feed = "";
    if(exerciseData !== undefined && exerciseData.score !== undefined && exerciseData.correctAnswer !== undefined && exerciseData.feedback !== undefined){
            abc = exerciseData.score;
            ans = exerciseData.correctAnswer;
            feed = exerciseData.feedback;
    }
    const [output, setOutput] = useState<string>();
    const [selectedAnswer, setSelectedAnswer] = useState<string>();
    const [correctAnswer, setCorrectAnswer] = useState<string>(ans);
    const [itemList, setItemList] = useState<JSX.Element[]>();
    
    const [abcFile, setAbcFile] = useState<string>(abc);
    const [ana, setAna] = useState<string>();

    /* window.onload = function() {
        let abc_editor = new abcjs.Editor("abc", {canvas_id: "paper"});
    } */   

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

    const highlight = function (note: any, klass: any) {
        
        var selTim = note.abselem.elemset[0].getAttribute("selectedTimes");
        if (klass === undefined)
            klass = "abcjs-note_selected";
        if (selTim <= 0) {
            color = "#ff0000";
        }
        if (selTim == 1) {
            color = "#00ff00";
        }
        if (selTim == 2) {
            color = "#0000ff";
        }
        if (selTim == 3) {
            color = "#000000";
            selTim = -1;
        }
        selTim++;
        note.abselem.elemset[0].setAttribute("selectedTimes", selTim);
        setClass(note.abselem.elemset, klass, "", color);
    };

    const clickListener = function (abcelem:any, tuneNumber: number, classes:string, analysis:abcjs.ClickListenerAnalysis, drag:abcjs.ClickListenerDrag){
    
        var op = JSON.stringify(drag.index);
        setOutput(op);
        setAna(JSON.stringify(drag.index));
        visualObj = visualObjs[0];
        var note = abcelem;
        if(!(note.abselem.elemset[0].getAttribute("selectedTimes"))) {
            note.abselem.elemset[0].setAttribute("selectedTimes", 0)
        }
        console.log(note);
        console.log(note.abselem.elemset[0].getAttribute("selectedTimes"));
        highlight(note, undefined);
        var test = document.querySelector(".clicked-info");
        if(test !== null) {test.innerHTML = "<div class='label'>Clicked info:</div>" + op;}
    }
    
    const loadScore = function() {
        // sample file: "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3"
        var abcString = abcFile;
        var el = document.getElementById("target");
        if(el !== null && abcString !== undefined){visualObjs = abcjs.renderAbc(el,abcString,{ clickListener: clickListener, selectTypes: ["note"]});}
        /* var el2 = document.getElementById("test");
        var abc = document.getElementById("text");
        if(el2 !== null && abc !== null) {
            //let editor = new abcjs.Editor("abc", {canvas_id: "el"});
            abc.innerHTML = abcFile;
        } */
        console.log(visualObjs);
        
    }
    const save = function(){
        if(abcFile !== undefined && selectedAnswer !== undefined){
            let data = new ExerciseData(abcFile, selectedAnswer, "");
            setExerciseData(data);
        }
            
    }

    const selectAnswer = function() {
        if(output !== undefined && selectedAnswer !== output) {
            const newSelected = (output);
            setSelectedAnswer(newSelected);
        }else{
            setSelectedAnswer('');
        }
    }

    return (
        <div>
            {/* <div id="paper"></div>
            <textarea id="abc"></textarea> */}
            {teacherMode===true?
            <span>
                <FileUpload setFiles={setFiles} files={files} setAbcFile={setAbcFile}></FileUpload>
                <button onClick={loadScore}>Load Score</button>
                <div id ="target"></div>
                <div className="clicked-info"></div>
                <div>Analysis: {ana}</div>
                <button onClick={selectAnswer}>Select Answer</button>
                <div>Currently selected answer:</div>
                <ul>
                    <li>{selectedAnswer}</li>
                </ul>
                <button onClick={save}>Save</button>
                
                {/* <textarea id="abc"></textarea>
                <div id="paper"></div> */}
                
            </span>
            :
            <span>
            <button onClick={loadScore}>Load Score</button>
            <div id ="target"></div>
            <div className="clicked-info"></div>
            <AudioHandler files={files}></AudioHandler>
            <div>Analysis: {ana}</div>
            <button onClick={selectAnswer}>Check Answer</button>
            {selectedAnswer !== undefined ? (
                selectedAnswer === correctAnswer ? 
                    <div>Correct!</div>
                    :
                    <div>Incorrect </div>) : 
                <div>Select an Answer</div>
            }
            
            {/* <div id="paper"></div>
            <textarea id="abc"></textarea> */}
            </span>
            }
            
        </div>

    );
}