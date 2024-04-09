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
    })
    const [diff, setDiff] = useState<string>();
    const [tags, setTags] = useState<string[]>([]);
    const [selExercise, setSelExercise] = useState<ExerciseData |  undefined>(undefined);

    const exChange = function (e:React.MouseEvent<HTMLSpanElement>){
        /* const shown = document.querySelector({exercise.title}) */
        setSelExercise(allExData.find((exercise: ExerciseData | undefined) => {if (exercise !== undefined && exercise.title === (e.target as Element).id){return exercise}}));

    }
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff((e.target.value));
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
    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercises Page!</h2>
            <div style={{float:'left'}}>
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
                {/* nothing selected */}
                {tags.length === 0 && diff === undefined ? allExData.map(function(exercise){
                    if(exercise !== undefined)
                    return (
                    <div id = {exercise.title} onClick={exChange}>
                        {exercise.title}
                    </div>
                    )
                    else return <></>;
                    /* no diff selected / ALL */
                }):(diff === undefined || diff === "All") ? allExData.filter(function(exercise) {
                    if (exercise !== undefined && tags !== undefined && exercise.tags !== undefined){return tags.sort().toString() === exercise.tags.sort().toString() }}).map(function(exercise){
                        if(exercise !== undefined)
                        return (
                        <div id = {exercise.title} onClick={exChange}>
                            {exercise.title}
                        </div>
                        )
                        else return <></>;
                        /* diff selected */
                    }):(tags.length === 0) ? allExData.filter(function(exercise) {
                        if (exercise !== undefined){return diff === String(exercise.difficulty)}}).map(function(exercise){
                            if(exercise !== undefined)
                            return (
                            <div id = {exercise.title} onClick={exChange}>
                                {exercise.title}
                            </div>
                            )
                            else return <></>;
                            /* both selected */
                        }):allExData.filter(function(exercise) {
                if (exercise !== undefined && tags !== undefined && exercise.tags !== undefined){return tags.sort().toString() === exercise.tags.sort().toString() && diff === String(exercise.difficulty)}}).map(function(exercise){
                    if(exercise !== undefined)
                    return (
                    <div id = {exercise.title} onClick={exChange}>
                        {exercise.title}
                    </div>
                    )
                    else return <></>;
                })
                }
           </div>
            <div style={{float:'right',width:'70%'}}>
                {selExercise !== undefined ? <Exercise key={selExercise.exIndex} teacherMode={false} ExData={selExercise} allExData={allExData} setAllExData={setAllExData} exIndex={selExercise.exIndex}></Exercise>: <></>}
                
            </div>
            
            <br></br>


            
            {/* <Button variant="success" onClick={fetch}>Sync with Database</Button> */}
            {/* <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData}files ={files} setFiles={setFiles} exIndex={0}></Exercise>

            <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData} files ={files} setFiles={setFiles} exIndex={1}></Exercise> */}
        </div>

    );
}
