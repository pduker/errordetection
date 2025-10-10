//imports
import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { isDisabled } from '@testing-library/user-event/dist/utils';

//function to create the exercise page, takes exercise data and renders a page
export function ExercisesPage({
    allExData,
    setAllExData,
    defaultTags,
    scoresRet
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    defaultTags: string[];
    scoresRet: boolean;
}){
    //state init for the differnt attributes
    const [diff, setDiff] = useState<string>("All");
    const [types, setTypes] = useState<string>("None");
    const [meter, setMeter] = useState<string>("Anything");
    const [voices, setVoices] = useState<number>(0);
    const [tags, setTags] = useState<string[]>(defaultTags);
    const [transpos, setTranspos] = useState<boolean>(false);

    const [upd, setUpd] = useState<boolean>(false);
    const [selExercise, setSelExercise] = useState<ExerciseData |  undefined>(undefined);
    const [exList, setExList] = useState<(ExerciseData | undefined)[]>([]);

    //adding in state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; //show 5 exercises at a time

    //showing exercises for the current page
    const startIndex = (currentPage -1) * pageSize;
    const pageExercises = exList.slice(startIndex, startIndex + pageSize);

    //pagination functions, navigate between functions
    const nextPage = () =>{
        if (currentPage < Math.ceil(exList.length /pageSize)){
            setCurrentPage(currentPage + 1);
        }
    }

    const prevPage = () => {
        if (currentPage > 1){
            setCurrentPage(currentPage - 1);
        }
    }

    //sort exercises function, takes user input an dorders exerceses based on the input
    const sortExercises = function (input: string | string[] | number | boolean, inputType:string) {
        var tempTags = tags, tempDiff = diff, tempVoices = voices, tempTypes = types, tempMeter = meter, tempTranspos = transpos;
        //what parameter to filter by
        if (inputType === "tags") tempTags = input as string[];
        else if (inputType === "diff")tempDiff = input as string;
        else if (inputType === "voices") tempVoices = input as number;
        else if (inputType === "types") tempTypes = input as string;
        else if (inputType === "meter") tempMeter = input as string;
        else if (inputType === "transpos") tempTranspos = input as boolean;
        
        //extra logic based on certain input values
        var list: (ExerciseData | undefined)[] = [...allExData];
        if (tempTags.length > 0) {
            list = list.filter(function(exercise) {
                if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                    return tempTags.every((element) => exercise.tags.includes(element))
                }
                else return false;})
        }
        if (tempDiff !== "All") {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempDiff === String(exercise.difficulty) 
                else return false;})
        }
        if (tempVoices !== 0) {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempVoices === exercise.voices
                else return false;})
        }
        if (tempTypes !== "None") {
            list = list.filter(function(exercise) {
                if (exercise !== undefined){
                    return (tempTypes === exercise.types)}
                else return false;})
        }
        if (tempMeter !== "Anything") {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempMeter === String(exercise.meter)
                else return false;})
        }
        if (tempTranspos === true) {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempTranspos === exercise.transpos;
                else return false;})
        }
        list = list.sort(exSortFunc);
        setExList(list);
    } 

    //loads the sorted exercises
    useEffect(() => {
        if(exList.length === 0) {
            if(tags.length === 0 && diff === "All" && voices === 0 && types === "None" && meter === "Anything" && !transpos) setExList(allExData.sort(exSortFunc));
            else if(tags.length > 0 && diff === "All" && voices === 0 && types === "None" && meter === "Anything" && !transpos && !upd) {
                sortExercises(tags,"tags");
                setUpd(true);
            }
        }
    }, [exList.length, tags, diff, voices, types, meter, transpos, allExData, upd, sortExercises]);

    //exercise sort function for comparing exercises against each other
    const exSortFunc = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            try {
                //alphabetical comparison?
                if(e1.title.startsWith("Exercise ") && e2.title.startsWith("Exercise ")) {
                    if (e1.title > e2.title) return 1;
                    else if (e1.title < e2.title) return -1;
                    else return 0;
                }
                //tags sort?
                else if(e1.title.startsWith("Exercise ")) return 1;
                else if(e2.title.startsWith("Exercise ")) return -1;
                var e1Sorted = e1.tags.sort().length;
                var e2Sorted = e2.tags.sort().length;
                if (e1Sorted > e2Sorted) return 1;
                else if (e1Sorted < e2Sorted) return -1;
                else {
                    //difficulty sort
                    if(Number(e1.difficulty) > Number(e2.difficulty)) return 1;
                    else if(Number(e1.difficulty) < Number(e2.difficulty)) return -1;
                    else {
                        let e1Split = e1.title.split(":"), e2Split = e2.title.split(":");
                        if(Number(e1Split[e1Split.length-1]) > Number(e2Split[e2Split.length-1])) return 1;
                        else if(Number(e1Split[e1Split.length-1]) < Number(e2Split[e2Split.length-1])) return -1;
                        else {
                            if (e1.title > e2.title) return 1;
                            else if (e1.title < e2.title) return -1;
                            else return 0;
                        }
                    }
                }
            } catch {
                if(e1.title > e2.title) return 1;
                else if(e1.title < e2.title) return -1;
                else return 0;
            };
        } else return 0;
    }

    //exercise change function for when you want to move from one exercise to the next
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

    //all the onClick functions for when a sorting field is changed
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff((e.target.value));
        setCurrentPage(1);
        sortExercises(e.target.value,"diff");
    }
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if(tags.includes(val)) {
            tags.splice(tags.indexOf(val), 1);
            setTags([...tags]);
            setCurrentPage(1);
            sortExercises([...tags],"tags");
        } else {
            setTags([...tags, val]);
            setCurrentPage(1);
            sortExercises([...tags, val],"tags");
        } 
    }
    const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setVoices(Number(e.target.value));
        setCurrentPage(1);
        sortExercises(Number(e.target.value),"voices");
    }
    const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>){
        setTypes(e.target.value);
        setCurrentPage(1);
        sortExercises(e.target.value,"types");
    }
    const meterChange = function(e: React.ChangeEvent<HTMLSelectElement>) {
        setMeter(e.target.value);
        setCurrentPage(1);
        sortExercises(e.target.value, "meter");
    }
    const transposChange = function(e: React.ChangeEvent<HTMLInputElement>) {
        setTranspos(!transpos);
        setCurrentPage(1);
        sortExercises(!transpos, "transpos");
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
        var diffBox = document.getElementsByName("difficulty")[0] as HTMLSelectElement;
        if (diffBox !== null) diffBox.options[0].selected = true;

        setVoices(0);
        var voiceBox = document.getElementsByName("voices")[0] as HTMLSelectElement;
        if (voiceBox !== null) voiceBox.options[0].selected = true;

        setTypes("None");
        var typesBox = document.getElementsByName("types")[0] as HTMLSelectElement;
        if(typesBox !== null) typesBox.options[0].selected = true;

        setMeter("Anything");
        var meterBox = document.getElementsByName("meter")[0] as HTMLSelectElement;
        if(meterBox !== null) meterBox.options[0].selected = true;
        
        setTranspos(false);

    }

    //html to render page
    return (
        <div style={{ width: "100%", marginTop: "10px", display: "flex", flexDirection: "row", minHeight: "350px" }}> {/* SIR: added minHeight to prevent jitter */}
            <div style={{ paddingRight: "2vw", flexWrap: "wrap",width: "35%", minHeight: "700px", display: "flex", flexDirection: "column"}}> {/* SIR: left column div */}
            <h2 style={{display: "flex", alignItems: "left"}}>Welcome to the Exercises Page!</h2>
            <h5 style={{fontStyle: "italic", flexDirection: "column"}}>Sort by any of the given fields, then click an exercise to get started.</h5>
                <span>
                <div id="boxes" style={{ display: "inline-flex", padding: "4px" }}>
                    <form id="tags" style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                        <div style={{ fontSize: "16px", marginRight: "8px" }}>Tags:</div>
                        <label style={{ display: "flex", alignItems: "center", marginRight: "12px" }}>
                            <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange} style={{ marginRight: "4px" }} />
                            Pitch
                        </label>
                        <label style={{ display: "flex", alignItems: "center", marginRight: "12px"}}>
                            <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange} style={{ marginRight: "4px" }} />
                            Intonation
                        </label>
                        <label style={{ display: "flex", alignItems: "center" }}>
                            <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange} style={{ marginRight: "4px" }} />
                            Rhythm
                        </label>
                    </form>
                    <form id="transpos" style={{ display: "flex", alignItems: "center", marginLeft: "-20px" }}>
                        <input type="checkbox" name="transpos" value="buh" checked={transpos} onChange={transposChange} style={{ marginRight: "4px" }} />
                        <div style={{ fontSize: "16px", whiteSpace: "nowrap" }}>Transposing Instruments</div>
                    </form>
                </div>



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

                        <Button variant="danger" onClick={resetSort} style={{marginLeft: "8px"}}>Reset Sort</Button>
                    </div>
                    
                </span>
                <div style={{flex: "1", display: "flex", flexDirection: "column", minWidth:"200px"}}> {/* SIR: listed exercises, added minHeight to prevent jitter */}
                {/* pull from paginated exercises */}
                {pageExercises.map(function(exercise){
                    if(exercise !== undefined) {
                        return (
                        <div key = {exercise.title} id = {exercise.title} onClick={exChange} style={{margin: "8px", padding: "6px", cursor: "pointer", backgroundColor: "#fcfcd2", borderRadius: "2px"}}>
                            {exercise.title}
                        </div>
                        )}
                    else return <></>;
                })}
                <div style={{marginTop: "auto"}}>
                {/* add page navigation buttons, call newly defined functions */}
                
                        <Button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            style={{
                                marginRight: "8px",
                                fontSize: "2.5rem",
                                background: "none",
                                border:"none",
                                color: currentPage === 1 ? "gray" : "black",
                                padding: "0 8px",
                                fontWeight: "bold",
                                lineHeight: "1"}}
                        >
                            ‹
                        </Button>
                        <span> Page {currentPage} of {Math.ceil(exList.length / pageSize)} </span>
                        <Button
                            onClick={nextPage}
                            disabled={currentPage >= Math.ceil(exList.length / pageSize)}
                            style={{marginLeft: "8px",fontSize: "2.5rem",
                                background: "none",
                                border:"none",
                                color: currentPage >= Math.ceil(exList.length / pageSize) ? "gray" : "black",
                                padding: "0 8px",
                                fontWeight: "bold",
                                lineHeight: "1"}}
                        >
                            ›
                        </Button>
                    </div>
                </div>
                {exList.length === 0 ? 
                    !scoresRet ? <div>Loading scores... this process should take 2-10 seconds. If nothing changes after 10 seconds, try sorting using the above criteria.</div> : 
                <div>No exercises with those criteria found!</div> : <></>}
            </div>
            <div style={{ width:'65%', marginLeft: "2vw", flexWrap: "wrap",}}> 
                {selExercise !== undefined ? <div> {/*SIR: DIV tag for the loaded exercise*/}
                    <Exercise 
                        key={selExercise.exIndex} 
                        teacherMode={false} 
                        ExData={selExercise} 
                        allExData={allExData} 
                        setAllExData={setAllExData} 
                        exIndex={selExercise.exIndex} 
                        handleSelectExercise={undefined} 
                        isSelected={undefined}
                        fetch={undefined}
                    />
                    
                </div> : <></>}
            
            <div style={{display:"flex", justifyContent: "center", marginLeft: "160px"}}> {/* SIR: added marginLeft to back/next button */}
                <button  className= "btnback" id="back-btn" hidden={true} disabled={false} onClick={prevEx}>Back</button>
                <button className= "btnback" id="next-btn" hidden={true} disabled={false} onClick={nextEx}>Next</button>
            </div>
            
                
            </div>
            
            <br></br>


            
            {/* <Button variant="success" onClick={fetch}>Sync with Database</Button> */}
            {/* <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData}files ={files} setFiles={setFiles} exIndex={0}></Exercise>

            <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData} files ={files} setFiles={setFiles} exIndex={1}></Exercise> */}
        </div>

    );
}