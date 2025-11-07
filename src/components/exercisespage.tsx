//imports
import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
// import { isDisabled } from '@testing-library/user-event/dist/utils';

import { AppSidebar } from './sidebar';
import { FaBars } from 'react-icons/fa'; // <-- Import an icon for the toggle

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
    const totalPages = Math.ceil(exList.length / pageSize);
    const paginationStatus = totalPages === 0 ? "Loading..." : `Page ${currentPage} of ${totalPages}`;

    // state for sidebar
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);

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

    const sortExercises = React.useCallback((input: string | string[] | number | boolean, inputType: string) => {
        var tempTags = tags, tempDiff = diff, tempVoices = voices, tempTypes = types, tempMeter = meter, tempTranspos = transpos;
        // what parameter to filter by
        if (inputType === "tags") tempTags = input as string[];
        else if (inputType === "diff") tempDiff = input as string;
        else if (inputType === "voices") tempVoices = input as number;
        else if (inputType === "types") tempTypes = input as string;
        else if (inputType === "meter") tempMeter = input as string;
        else if (inputType === "transpos") tempTranspos = input as boolean;
        
        var list: (ExerciseData | undefined)[] = [...allExData];
        if (tempTags.length > 0) {
        list = list.filter(function(exercise) {
            if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
            return tempTags.every((element) => exercise.tags.includes(element));
            } else return false;
        });
        }
        if (tempDiff !== "All") {
        list = list.filter(function(exercise) {
            if (exercise !== undefined) 
            return tempDiff === String(exercise.difficulty);
            else return false;
        });
        }
        if (tempVoices !== 0) {
        list = list.filter(function(exercise) {
            if (exercise !== undefined) 
            return tempVoices === exercise.voices;
            else return false;
        });
        }
        if (tempTypes !== "None") {
        list = list.filter(function(exercise) {
            if (exercise !== undefined){
            return (tempTypes === exercise.types);
            } else return false;
        });
        }
        if (tempMeter !== "Anything") {
        list = list.filter(function(exercise) {
            if (exercise !== undefined) 
            return tempMeter === String(exercise.meter);
            else return false;
        });
        }
        if (tempTranspos === true) {
        list = list.filter(function(exercise) {
            if (exercise !== undefined) 
            return tempTranspos === exercise.transpos;
            else return false;
        });
        }
        list = list.sort(exSortFunc);
        setExList(list);
    },
    [tags, diff, voices, types, meter, transpos, allExData] // dependencies
    );

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

    const handleTagToggle = React.useCallback((tag: string) => {
        const hasTag = tags.includes(tag);
        const updated = hasTag ? tags.filter((item) => item !== tag) : [...tags, tag];
        setTags(updated);
        setCurrentPage(1);
        sortExercises(updated, "tags");
    }, [tags, sortExercises]);

    const handleTransposToggle = React.useCallback(() => {
        const next = !transpos;
        setTranspos(next);
        setCurrentPage(1);
        sortExercises(next, "transpos");
    }, [transpos, sortExercises]);

    const handleDifficultySelect = React.useCallback((value: string) => {
        setDiff(value);
        setCurrentPage(1);
        sortExercises(value, "diff");
    }, [sortExercises]);

    const handleVoicesSelect = React.useCallback((value: number) => {
        setVoices(value);
        setCurrentPage(1);
        sortExercises(value, "voices");
    }, [sortExercises]);

    const handleMeterSelect = React.useCallback((value: string) => {
        setMeter(value);
        setCurrentPage(1);
        sortExercises(value, "meter");
    }, [sortExercises]);

    const handleTexturalFactorSelect = React.useCallback((value: string) => {
        setTypes(value);
        setCurrentPage(1);
        sortExercises(value, "types");
    }, [sortExercises]);

    //all the onClick functions for when a sorting field is changed
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        handleDifficultySelect(e.target.value);
    }
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        handleTagToggle(e.target.value);
    }
    const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        handleVoicesSelect(Number(e.target.value));
    }
    const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>){
        handleTexturalFactorSelect(e.target.value);
    }
    const meterChange = function(e: React.ChangeEvent<HTMLSelectElement>) {
        handleMeterSelect(e.target.value);
    }
    const transposChange = function(e: React.ChangeEvent<HTMLInputElement>) {
        handleTransposToggle();
    }

    //onClick function for when Back button is pushed under exercise
    const prevEx = function () {
        const exPos = exList.indexOf(selExercise);
        const bBtn = document.getElementById("back-btn");
        const nBtn = document.getElementById("next-btn");

        if (exList.length === 0) return;

        let targetIndex = 0;
        if (exPos > 0) {
            targetIndex = exPos - 1;
        } else if (exPos >= exList.length) {
            targetIndex = exList.length - 1;
        }

        const targetExercise = exList[targetIndex];
        if (targetExercise !== undefined) {
            setSelExercise(targetExercise);
            setCurrentPage(Math.floor(targetIndex / pageSize) + 1);
        }

        if (bBtn !== null && "disabled" in bBtn) {
            bBtn.disabled = targetIndex <= 0;
        }
        if (nBtn !== null && "disabled" in nBtn) {
            nBtn.disabled = exList.length < 2 || targetIndex >= exList.length - 1;
        }
    }

    //onClick function for when Next button is pushed under exercise
    const nextEx = function () {
        const bBtn = document.getElementById("back-btn");
        const nBtn = document.getElementById("next-btn");
        const exPos = exList.indexOf(selExercise);
        if (exList.length === 0) return;

        let targetIndex = exPos;
        if (exPos === -1) {
            targetIndex = 0;
        } else if (exPos < exList.length - 1) {
            targetIndex = exPos + 1;
        } else {
            targetIndex = exList.length - 1;
        }

        const targetExercise = exList[targetIndex];
        if (targetExercise !== undefined) {
            setSelExercise(targetExercise);
            setCurrentPage(Math.floor(targetIndex / pageSize) + 1);
        }

        if (bBtn !== null && "disabled" in bBtn) {
            bBtn.disabled = targetIndex <= 0;
        }
        if (nBtn !== null && "disabled" in nBtn) {
            nBtn.disabled = targetIndex >= exList.length - 1;
        }
    }

    //onClick to reset all exercise sort fields
    const resetSort = function () {
        setTags([]);
        setDiff("All");
        setVoices(0);
        setTypes("None");
        setMeter("Anything");
        setTranspos(false);
        setCurrentPage(1);
        setExList([...allExData].sort(exSortFunc));
    }

    // Toggle function for the sidebar
    const toggleSidebar = () => {
      setSidebarCollapsed(!isSidebarCollapsed);
    };

    //html to render page
    return (
        <div className="fullpage" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <AppSidebar
                isCollapsed={isSidebarCollapsed}
                selectedTags={tags}
                onToggleTag={handleTagToggle}
                transposing={transpos}
                onToggleTransposing={handleTransposToggle}
                difficulty={diff}
                onSelectDifficulty={handleDifficultySelect}
                voices={voices}
                onSelectVoices={handleVoicesSelect}
                meter={meter}
                onSelectMeter={handleMeterSelect}
                texturalFactor={types}
                onSelectTexturalFactor={handleTexturalFactorSelect}
                onResetSort={resetSort}
            />
            <div className="ex-page-container"> 

                {/* --- This new wrapper holds the button AND your two columns --- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* --- 1. The Toggle Button --- */}
                    <Button
                        onClick={toggleSidebar}
                        variant="light"
                        className="sidebar-toggle-button"
                        style={{ marginBottom: "1rem", width: "fit-content", position: "relative" }}
                    >
                        <FaBars />
                    </Button>

                    {/* --- 2. This wrapper holds your two columns side-by-side --- */} 
                    <div className = "two-column-wrapper" style={{ display: 'flex', flex: 1, gap: '20px' }}> 
            
                        {/* --- COLUMN 1: Your original 'ex-left' --- */}
                        <div className="ex-left"> {/* SIR: left column div */}
                            <h2 style={{fontSize: "1.9rem"}}>Welcome to the Exercises Page!</h2> {/*SIR: changed fontSize for consistency*/}
                            <h5 style={{fontStyle: "italic", fontSize: "1rem"}}>Sort by any of the given fields, then click an exercise to get started.</h5> {/*SIR: changed fontSize for consistency*/}

                            {exList.length === 0 ? 
                                !scoresRet ? <div>Loading scores... this process should take 2-10 seconds. <br /> If nothing changes after 10 seconds, try sorting using the above criteria.</div> : 
                            <div>No exercises with those criteria found!</div> : <></>}
                            
                            <div style={{marginTop: "8px", display: "flex", alignItems: "center", gap: "8px"}}>
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
                                    <span>{paginationStatus}</span>
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
                            <div style={{flex: "1", display: "flex", flexDirection: "column", minWidth:"200px"}}> {/* SIR: listed exercises, added minHeight to prevent jitter */}
                            {/* pull from paginated exercises */}
                            {pageExercises.map(function(exercise){
                                if(exercise !== undefined) {
                                    const isActive = selExercise?.exIndex === exercise.exIndex;
                                    return (
                                    <div
                                        key = {exercise.title}
                                        id = {exercise.title}
                                        onClick={exChange}
                                        role="button"
                                        aria-pressed={isActive}
                                        className={`exercise-list-item${isActive ? " active" : ""}`}>
                                        {exercise.title}
                                    </div>
                                    )}
                                else return <></>;
                            })}
                            </div>
                        </div>

                        {/* --- COLUMN 2: Your original 'ex-right' --- */}
                        <div className="ex-right"> {/*SIR: DIV tag for the loaded exercise*/}
                            {selExercise !== undefined ? (
                            <div> 
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
                            </div> 
                            ) : (
                                <div className="exercise-placeholder"> {/*SIR: Added placeholder when no exercise is loaded*/}
                                    <h3>No exercise loaded</h3>
                                    <p>Select an exercise from the left to begin.</p>
                                </div>
                        )}
                        
                        <div style={{display:"flex", justifyContent: "center", marginLeft: "160px"}}> {/* SIR: added marginLeft to back/next button */}
                            <button  className= "btnback" id="back-btn" hidden={true} disabled={false} onClick={prevEx}>Back</button>
                            <button className= "btnback" id="next-btn" hidden={true} disabled={false} onClick={nextEx}>Next</button>
                        </div>
                        
                            
                        </div>
                    
                    </div> {/* --- End of two-column wrapper --- */}
                </div> {/* --- End of main content + button wrapper --- */}
            </div> {/* --- End of ex-page-container --- */}
        </div> // --- End of root flex container ---
    );
}
