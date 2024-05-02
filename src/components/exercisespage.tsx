import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

export function ExercisesPage({
    allExData,
    setAllExData,
    defaultTags
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    defaultTags: string[];
}){
    useEffect(() => {
        //fetch();
        if(exList.length === 0) {
            if(tags.length === 0 && diff === "All" && voices === 0 && types === "None" && meter === "Anything") setExList(allExData.sort(exSortFunc));
            else if(tags.length > 0 && diff === "All" && voices === 0 && types === "None" && meter === "Anything" && !upd) {
                sortExercises(tags,"tags");
                setUpd(true);
            }
        }
    })

    const [diff, setDiff] = useState<string>("All");
    const [types, setTypes] = useState<string>("None");
    const [meter, setMeter] = useState<string>("Anything");
    const [voices, setVoices] = useState<number>(0);
    const [tags, setTags] = useState<string[]>(defaultTags);
    const [upd, setUpd] = useState<boolean>(false);
    const [selExercise, setSelExercise] = useState<ExerciseData |  undefined>(undefined);
    const [exList, setExList] = useState<(ExerciseData | undefined)[]>([]);

    const sortExercises = function (input: string | string[] | number, inputType:string) {
        var tempTags = tags, tempDiff = diff, tempVoices = voices, tempTypes = types, tempMeter = meter;
        if (inputType === "tags") tempTags = input as string[];
        else if (inputType === "diff")tempDiff = input as string;
        else if (inputType === "voices") tempVoices = input as number;
        else if (inputType === "types") tempTypes = input as string;
        else if (inputType === "meter") tempMeter = input as string;
        
        var list: (ExerciseData | undefined)[] = [];
        var method = "all";
        if (tempTags.length === 0 && tempDiff === "All" && tempVoices === 0 && tempTypes === "None" && tempMeter === "Anything") method = "";
        else if (tempDiff === "All" && tempVoices === 0 && tempTypes === "None" && tempMeter === "Anything") method = "tags";
        else if (tempTags.length === 0 && tempVoices === 0 && tempTypes === "None" && tempMeter === "Anything") method = "diff";
        else if (tempTags.length === 0 && tempDiff === "All" && tempTypes === "None" && tempMeter === "Anything") method = "voices";
        else if (tempVoices === 0 && tempTypes === "None" && tempMeter === "Anything") method = "diffTags";
        else if (tempTags.length === 0 && tempTypes === "None" && tempMeter === "Anything") method = "diffVoices";
        else if (tempDiff === "All" && tempTypes === "None" && tempMeter === "Anything") method = "tagsVoices";
        else if (tempDiff === "All" && tempVoices === 0 && tempTags.length === 0 && tempMeter === "Anything") method = "types";
        else if (tempDiff === "All" && tempVoices === 0 && tempMeter === "Anything") method = "tagsTypes";
        else if (tempTags.length === 0 && tempVoices === 0 && tempMeter === "Anything") method = "diffTypes";
        else if (tempTags.length === 0 && tempDiff === "All" && tempMeter === "Anything") method = "voicesTypes";
        else if (tempVoices === 0 && tempMeter === "Anything") method = "diffTagsTypes";
        else if (tempTags.length === 0 && tempMeter === "Anything") method = "diffVoicesTypes";
        else if (tempDiff === "All" && tempMeter === "Anything") method = "tagsVoicesTypes";
        else if (tempTypes === "None" && tempMeter === "Anything") method = "diffTagsVoices";
        else if (tempDiff === "All" && tempVoices === 0 && tempTags.length === 0 && tempTypes === "None") method = "meter";
        else if (tempDiff === "All" && tempVoices === 0 && tempTypes === "None")  method = "tagsMeter";
        else if (tempTags.length === 0 && tempVoices === 0 && tempTypes === "None" ) method = "diffMeter";
        else if (tempTags.length === 0 && tempDiff === "All" && tempTypes === "None") method = "voicesMeter";
        else if (tempVoices === 0 && tempTypes === "None") method = "diffTagsMeter";
        else if (tempTags.length === 0 && tempTypes === "None") method = "diffVoicesMeter";
        else if (tempDiff === "All" && tempTypes === "None") method = "tagsVoicesMeter";
        else if (tempDiff === "All" && tempVoices === 0 && tempTags.length === 0) method = "typesMeter";
        else if (tempDiff === "All" && tempVoices === 0) method = "tagsTypesMeter";
        else if (tempTags.length === 0 && tempVoices === 0) method = "diffTypesMeter";
        else if (tempTags.length === 0 && tempDiff === "All") method = "voicesTypesMeter";
        else if (tempVoices === 0) method = "diffTagsTypesMeter";
        else if (tempTags.length === 0) method = "diffVoicesTypesMeter";
        else if (tempDiff === "All") method = "tagsVoicesTypesMeter";
        else if (tempTypes === "None") method = "diffTagsVoicesMeter";
        else if (tempMeter === "Anything") method = "diffTagsVoicesTypes"
        
        //console.log(method);
        switch (method) {
            case "diff": // only diff selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempDiff === String(exercise.difficulty) 
                    else return false;})
                        .sort(exSortFunc);
                    
                setExList(list);
                break;
            case "tags": // only tags selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return tempTags.every((element) => exercise.tags.includes(element))
                    }
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "voices": // only voices selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempVoices === exercise.voices
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTags": // diff and tags selected (no voices)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element)) && tempDiff === String(exercise.difficulty))}
                    else return false;})
                        .sort(exSortFunc)
                setExList(list);
                break;
            case "diffVoices": // diff and voices selected (no tags)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return (tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices)
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "tagsVoices": // tags and voices selected (no diff)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempVoices === exercise.voices}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsVoices": // all sorting options selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "types":
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined){
                        return (tempTypes === exercise.types)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTypes": // only diff selected
            list = allExData.filter(function(exercise) {
                if (exercise !== undefined) 
                    return (tempDiff === String(exercise.difficulty) && tempTypes === exercise.types)
                else return false;})
                    .sort(exSortFunc);
            setExList(list);
            break;
            case "tagsTypes": // only tags selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element)) && tempTypes === exercise.types)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "voicesTypes": // only voices selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempVoices === exercise.voices && tempTypes === exercise.types
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsTypes": // diff and tags selected (no voices)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempTypes === exercise.types}
                    else return false;})
                        .sort(exSortFunc)
                setExList(list);
                break;
            case "diffVoicesTypes": // diff and voices selected (no tags)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return (tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices) && tempTypes === exercise.types
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "tagsVoicesTypes": // tags and voices selected (no diff)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempVoices === exercise.voices && tempTypes === exercise.types}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            //
            case "meter": // only diff selected
            list = allExData.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempMeter === String(exercise.meter)
                else return false;})
                    .sort(exSortFunc);
                
            setExList(list);
            break;
            case "diffMeter": // only diff selected
            list = allExData.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempDiff === String(exercise.difficulty) && tempMeter === String(exercise.meter)
                else return false;})
                    .sort(exSortFunc);
                
            setExList(list);
            break;
            case "tagsMeter": // only tags selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return tempTags.every((element) => exercise.tags.includes(element)) && tempMeter === String(exercise.meter)
                    }
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "voicesMeter": // only voices selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempVoices === exercise.voices && tempMeter === String(exercise.meter)
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsMeter": // diff and tags selected (no voices)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element)) && tempDiff === String(exercise.difficulty) && tempMeter === String(exercise.meter))}
                    else return false;})
                        .sort(exSortFunc)
                setExList(list);
                break;
            case "diffVoicesMeter": // diff and voices selected (no tags)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return (tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices && tempMeter === String(exercise.meter))
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "tagsVoicesMeter": // tags and voices selected (no diff)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempVoices === exercise.voices && tempMeter === String(exercise.meter)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsVoicesMeter": // all sorting options selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices && tempMeter === String(exercise.meter)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "typesMeter":
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined){
                        return (tempTypes === exercise.types) && tempMeter === String(exercise.meter)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTypesMeter": // only diff selected
            list = allExData.filter(function(exercise) {
                if (exercise !== undefined) 
                    return (tempDiff === String(exercise.difficulty) && tempTypes === exercise.types && tempMeter === String(exercise.meter))
                else return false;})
                    .sort(exSortFunc);
            setExList(list);
            break;
            case "tagsTypesMeter": // only tags selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element)) && tempTypes === exercise.types) && tempMeter === String(exercise.meter)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "voicesTypesMeter": // only voices selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempVoices === exercise.voices && tempTypes === exercise.types && tempMeter === String(exercise.meter)
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsTypesMeter": // diff and tags selected (no voices)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempTypes === exercise.types && tempMeter === String(exercise.meter)}
                    else return false;})
                        .sort(exSortFunc)
                setExList(list);
                break;
            case "diffVoicesTypesMeter": // diff and voices selected (no tags)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return (tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices) && tempTypes === exercise.types && tempMeter === String(exercise.meter)
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "tagsVoicesTypesMeter": // tags and voices selected (no diff)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempVoices === exercise.voices && tempTypes === exercise.types && tempMeter === String(exercise.meter)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "all": // all sorting options selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices && tempTypes === exercise.types && tempMeter === exercise.meter}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            default:
                list = allExData.sort(exSortFunc);
                setExList(list);
                break;
        }
    }

    const exSortFunc = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            try {
                if(e1.title.startsWith("Exercise ")) return 1;
                else if(e2.title.startsWith("Exercise ")) return -1;
                var e1Sorted = e1.tags.sort().length;
                var e2Sorted = e2.tags.sort().length;
                if (e1Sorted > e2Sorted) return 1;
                else if (e1Sorted < e2Sorted) return -1;
                else {
                    if (e1.title > e2.title) return 1;
                    else if (e1.title < e2.title) return -1;
                    else {
                        if(e1.difficulty > e2.difficulty) return 1;
                        else if(e1.difficulty < e2.difficulty) return -1;
                        else return 0;
                    }
                }
            } catch {
                if(e1.title > e2.title) return 1;
                else if(e1.title < e2.title) return -1;
                else return 0;
            };
        } else return 0;
    }

    const exChange = function (e:React.MouseEvent<HTMLSpanElement>){
        var ex = allExData.find((exercise: ExerciseData | undefined) => {if (exercise !== undefined && exercise.title === (e.target as Element).id){return exercise} else {return undefined}})
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

    //onClick function for diff change
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff((e.target.value));
        sortExercises(e.target.value,"diff");
    }

    //onClick function for tags change
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if(tags.includes(val)) {
            tags.splice(tags.indexOf(val), 1);
            setTags([...tags]);
            sortExercises([...tags],"tags");
        } else {
            setTags([...tags, val]);
            sortExercises([...tags, val],"tags");
        } 
    }

    //onClick function for voices change
    const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setVoices(Number(e.target.value));
        sortExercises(Number(e.target.value),"voices");
    }

    const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>){
        setTypes(e.target.value);
        sortExercises(e.target.value,"types");
        
    }
    const meterChange = function(e: React.ChangeEvent<HTMLSelectElement>) {
        setMeter(e.target.value);
        sortExercises(e.target.value, "meter");
    }

    //onClick function for when Back button is pushed under exercise
    const prevEx = function () {
        var exPos = exList.indexOf(selExercise);
        var bBtn = document.getElementById("back-btn");
        var nBtn = document.getElementById("next-btn");
        if(exPos !== -1) {
            setSelExercise(exList[exPos-1]);
            if (exPos-1 > 0) {
                if (bBtn !== null && "disabled" in bBtn) bBtn.disabled = false;
            }
            else {
                if (bBtn !== null && "disabled" in bBtn) bBtn.disabled = true;
            }
        } else {
            setSelExercise(exList[0]);
            if (bBtn !== null && "disabled" in bBtn) bBtn.disabled = true;
        }
        if (exList.length < 2) {
            if (nBtn !== null && "disabled" in nBtn) nBtn.disabled = true;
        } else {
            if (nBtn !== null && "disabled" in nBtn) nBtn.disabled = false;
        }
    }

    //onClick function for when Next button is pushed under exercise
    const nextEx = function () {
        var bBtn = document.getElementById("back-btn");
        var nBtn = document.getElementById("next-btn");
        var exPos = exList.indexOf(selExercise);
        setSelExercise(exList[exPos+1]);
        if (exPos+1 >= (exList.length - 1)) {
            if (nBtn !== null && "disabled" in nBtn && exPos !== -1) nBtn.disabled = true;
        }
        else {
            if (nBtn !== null && "disabled" in nBtn) nBtn.disabled = false;
        }
        if (exList.length < 2 || exPos === -1) {
            if (bBtn !== null && "disabled" in bBtn) bBtn.disabled = true;
        } else {
            if (bBtn !== null && "disabled" in bBtn) bBtn.disabled = false;
        }
    }

    //onClick to reset all exercise sort fields
    const resetSort = function () {
        setTags([]);
        setDiff("All");
        setMeter("Anything");
        var diffBox = document.getElementsByName("difficulty")[0] as HTMLSelectElement;
        if (diffBox !== null) diffBox.options[0].selected = true;
        setVoices(0);
        var voiceBox = document.getElementsByName("voices")[0] as HTMLSelectElement;
        if (voiceBox !== null) voiceBox.options[0].selected = true;
        setTypes("None");
        var typesBox = document.getElementsByName("types")[0] as HTMLSelectElement;
        if(typesBox !== null) typesBox.options[0].selected = true;
        var meterBox = document.getElementsByName("meter")[0] as HTMLSelectElement;
        if(meterBox !== null) meterBox.options[0].selected = true;

    }

    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercises Page!</h2>
            <h5 style={{fontStyle: "italic"}}>Sort by tags, difficulty, and voices, then click an exercise to get started.</h5>
            <div style={{float:'left', width: "30%"}}>
                <span>
                    <form id= "tags">
                        <div style={{fontSize:"16px", display:"inline"}}>Tags:</div>
                        <br></br>
                        <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange}style={{margin: "4px"}}/>Pitch
                        <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange} style={{marginLeft: "12px"}}/> Intonation
                        {/* <input type="checkbox" name="tags" value="Drone" checked={tags.includes("Drone")} onChange={tagsChange} style={{marginLeft: "12px"}}/> Drone
                        <input type="checkbox" name="tags" value="Ensemble" checked={tags.includes("Ensemble")} onChange={tagsChange} style={{marginLeft: "12px"}}/> Ensemble */}
                        {/* <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange}/>Rhythm */}
                    </form>
                    <div id="dropdowns" style={{display: "inline-flex", padding: "4px"}}>
                        <form id="difficulty">
                            <div style={{fontSize:"16px", display:"inline"}}>Difficulty:</div>
                            <br></br>
                            <select name="difficulty" onChange={diffChange}>
                                <option value="All">All</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                {/* <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option> */}
                            </select>
                        </form>
                        <form id="voiceCt">
                            Voices:
                            <br></br>
                            <select name="voices" onChange={voiceChange}>
                                <option value={0}>Any</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                {/* <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option> */}
                            </select>
                        </form>
                        <form id="meterForm">
                            Meter:
                            <br></br>
                            <select name='meter' defaultValue={types} onChange={meterChange}>
                                    <option value="Anything">Anything</option>
                                    <option value="Simple">Simple</option>
                                    <option value="Compound">Compound</option>
                                    
                            </select>
                        </form>
                        
                        
                    </div>
                    
                    <div style={{display: "inline-flex", padding: "4px"}}>
                        <form id='typesForm'>
                            Textural Factors:
                            <br></br>
                            <select name="types" onChange={typesChange}>
                                <option value="None">None</option>
                                <option value="Drone">Drone</option>
                                <option value="Ensemble Parts">Ensemble Parts</option>
                                <option value="Both">Drone & Ensemble Parts</option>
                            </select>
                        </form>

                        <Button variant="danger" onClick={resetSort} style={{marginLeft: "10px"}}>Reset Sort</Button>
                    </div>
                    
                </span>
                
                {exList.map(function(exercise){
                    if(exercise !== undefined) {
                        return (
                        <div key = {exercise.title} id = {exercise.title} onClick={exChange} style={{margin: "8px", padding: "6px", cursor: "pointer", backgroundColor: "#fcfcd2", borderRadius: "2px"}}>
                            {exercise.title}
                        </div>
                        )}
                    else return <></>;
                })}
                {exList.length === 0 ? <div>No exercises with those criteria found!</div> : <></>}
            </div>
            <div style={{float:'right',width:'70%'}}>
                {selExercise !== undefined ? <div>
                    <Exercise 
                        key={selExercise.exIndex} 
                        teacherMode={false} 
                        ExData={selExercise} 
                        allExData={allExData} 
                        setAllExData={setAllExData} 
                        exIndex={selExercise.exIndex} 
                        setNewExercise={undefined} 
                        handleSelectExercise={undefined} 
                        isSelected={undefined}
                        fetch={undefined}
                    />
                    
                </div> : <></>}
            <div style={{display:"flex", justifyContent: "center"}}>
                <button style={{width: "5%"}}id="back-btn" hidden={true} disabled={false} onClick={prevEx}>Back</button>
                <button style={{width: "5%"}} id="next-btn" hidden={true} disabled={false} onClick={nextEx}>Next</button>
            </div>
                
            </div>
            
            <br></br>


            
            {/* <Button variant="success" onClick={fetch}>Sync with Database</Button> */}
            {/* <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData}files ={files} setFiles={setFiles} exIndex={0}></Exercise>

            <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData} files ={files} setFiles={setFiles} exIndex={1}></Exercise> */}
        </div>

    );
}