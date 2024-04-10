import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import { getDatabase } from 'firebase/database';
import { ref, push, onValue, DataSnapshot } from 'firebase/database';
import React, { useState, useEffect, MouseEvent, MouseEventHandler } from 'react';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot, StorageReference } from 'firebase/storage';
import { Button } from 'react-bootstrap';

export function ExercisesPage({
    allExData,
    setAllExData,
    fetch
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    fetch: () => void;
}){
    useEffect(() => {
        fetch();
        if(exList.length === 0) {
            if(tags.length === 0) setExList(allExData.sort(exSortFunc));
        }
    })

    const sortExercises = function (input: string | string[]) {
        var tempTags = tags, tempDiff = diff;
        if (typeof(input) === "object") tempTags = input;
        else if (typeof(input) === "string") tempDiff = input;
        var list: (ExerciseData | undefined)[] = [];
        var method = "both";
        if (tempTags.length === 0 && (tempDiff === undefined || tempDiff === "All")) method = "";
        else if (tempDiff === undefined || tempDiff === "All") method = "tags";
        else if (tempTags.length === 0) method = "diff";
        switch (method) {
            case "diff": // no tags selected
                list = allExData.filter(function(exercise) {if (exercise !== undefined) return tempDiff === String(exercise.difficulty)}).sort(exSortFunc)
                setExList(list);
                break;
            case "tags": // no diff / "All" selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.sort().toString() === exercise.tags.sort().toString())}})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "both": // both selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.sort().toString() === exercise.tags.sort().toString()) && tempDiff === String(exercise.difficulty)}})
                        .sort(exSortFunc)
                setExList(list);
                break;
            default:
                list = allExData.sort(exSortFunc)
                setExList(list);
                break;
        }
    }

    const exSortFunc = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            try {
                var e1Sorted = e1.tags.sort().length;
                var e2Sorted = e2.tags.sort().length;
                var ex = [e1Sorted, e2Sorted];
                switch (ex.toString()) {
                    case "1,1":
                    case "2,2":
                    case "3,3": 
                        break;
                    case "1,2":
                    case "1,3":
                    case "2,3":
                        return -1;
                    case "2,1":
                    case "3,1":
                    case "3,2":
                        return 1;
                    default: 
                        break;
                }
                if (e1.title > e2.title) return 1;
                else if (e1.title < e2.title) return -1;
                else {
                    if(e1.difficulty > e2.difficulty) return 1;
                    else if(e1.difficulty < e2.difficulty) return -1;
                    else return 0;
                }
            } catch {
                if(e1.title > e2.title) return 1;
                else if(e1.title < e2.title) return -1;
                else return 0;
            };
        } else return 0;
    }

    const [diff, setDiff] = useState<string>();
    const [tags, setTags] = useState<string[]>([]);
    const [selExercise, setSelExercise] = useState<ExerciseData |  undefined>(undefined);
    const [exList, setExList] = useState<(ExerciseData | undefined)[]>([]);

    const exChange = function (e:React.MouseEvent<HTMLSpanElement>){
        var ex = allExData.find((exercise: ExerciseData | undefined) => {if (exercise !== undefined && exercise.title === (e.target as Element).id){return exercise}})
        var nBtn = document.getElementById("next-btn");
        var bBtn = document.getElementById("back-btn");
        if(exList.indexOf(ex) === (exList.length - 1)) {
            if (nBtn !== null && "disabled" in nBtn) {
                nBtn.disabled = true;
                nBtn.hidden = false;
            }
        }
        else {
            if (nBtn !== null && "disabled" in nBtn) {
                nBtn.disabled = false;
                nBtn.hidden = false;
            }
        }
        if(exList.indexOf(ex) === 0) {
            if (bBtn !== null && "disabled" in bBtn) {
                bBtn.disabled = true;
                bBtn.hidden = false;
            }
        }
        else {
            if (bBtn !== null && "disabled" in bBtn) {
                bBtn.disabled = false;
                bBtn.hidden = false;
            }
        }
        setSelExercise(ex);
    }

    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff((e.target.value));
        sortExercises(e.target.value);
    }

    //onClick function for tags change
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if(tags.includes(val)) {
            tags.splice(tags.indexOf(val), 1);
            setTags([...tags]);
            sortExercises([...tags]);
        } else {
            setTags([...tags, val]);
            sortExercises([...tags, val]);
        } 
    }

    const prevEx = function () {
        var exPos = exList.indexOf(selExercise);
        if(exPos !== -1) {
            setSelExercise(exList[exPos-1]);
            if (exPos > 1) {
                var btn = document.getElementById("next-btn");
                if (btn !== null && "disabled" in btn) btn.disabled = false;
            }
            else {
                var btn = document.getElementById("back-btn");
                if (btn !== null && "disabled" in btn) btn.disabled = true;
            }
        } else {
            setSelExercise(exList[0]);
            var btn = document.getElementById("back-btn");
            if (btn !== null && "disabled" in btn) btn.disabled = true;
            if (exList.length < 2) {
                var nBtn = document.getElementById("next-btn");
                if (nBtn !== null && "disabled" in nBtn) nBtn.disabled = true;
            }
        }
    }

    const nextEx = function () {
        var exPos = exList.indexOf(selExercise);
        setSelExercise(exList[exPos+1]);
        if (exPos < (exList.length - 2)) {
            var btn = document.getElementById("back-btn");
            if (btn !== null && "disabled" in btn && exPos !== -1) btn.disabled = false;
        }
        else {
            var btn = document.getElementById("next-btn");
            if (btn !== null && "disabled" in btn) btn.disabled = true;
        }
    }

    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercises Page!</h2>
            <div style={{float:'left'}}>
                <span>
                    <form id= "tags">
                        Tags:
                        <br></br>
                        <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange}/>Intonation
                        <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange}/>Pitch
                        <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange}/>Rhythm
                    </form>
                    <form id="difficulty">
                        Difficulty:
                        <br></br>
                        <select name="difficulty" onChange={diffChange}>
                            <option value="All">All</option>
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
                </span>
                
                {exList.map(function(exercise){
                    if(exercise !== undefined) {
                        return (
                        <div key = {exercise.title} id = {exercise.title} onClick={exChange}>
                            {exercise.title}
                        </div>
                        )}
                    else return <></>;
                })}
            </div>
            <div style={{float:'right',width:'70%'}}>
                {selExercise !== undefined ? <div>
                    <Exercise key={selExercise.exIndex} teacherMode={false} ExData={selExercise} allExData={allExData} setAllExData={setAllExData} exIndex={selExercise.exIndex}/>
                    
                </div> : <></>}
                <button id="back-btn" hidden={true} disabled={false} onClick={prevEx}>Back</button>
                <button id="next-btn" hidden={true} disabled={false} onClick={nextEx}>Next</button>
                
            </div>
            
            <br></br>


            
            {/* <Button variant="success" onClick={fetch}>Sync with Database</Button> */}
            {/* <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData}files ={files} setFiles={setFiles} exIndex={0}></Exercise>

            <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData} files ={files} setFiles={setFiles} exIndex={1}></Exercise> */}
        </div>

    );
}
