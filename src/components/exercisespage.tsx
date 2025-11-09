//imports

// import { isDisabled } from '@testing-library/user-event/dist/utils';

import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { AppSidebar } from './sidebar';

const exSortFunc = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
    if (e1 !== undefined && e2 !== undefined) {
        try {
            if (e1.title.startsWith("Exercise ") && e2.title.startsWith("Exercise ")) {
                if (e1.title > e2.title) return 1;
                else if (e1.title < e2.title) return -1;
                else return 0;
            } else if (e1.title.startsWith("Exercise ")) return 1;
            else if (e2.title.startsWith("Exercise ")) return -1;

            const e1TagCount = Array.isArray(e1.tags) ? e1.tags.length : 0;
            const e2TagCount = Array.isArray(e2.tags) ? e2.tags.length : 0;
            if (e1TagCount > e2TagCount) return 1;
            else if (e1TagCount < e2TagCount) return -1;
            else {
                if (Number(e1.difficulty) > Number(e2.difficulty)) return 1;
                else if (Number(e1.difficulty) < Number(e2.difficulty)) return -1;
                else {
                    let e1Split = e1.title.split(":"), e2Split = e2.title.split(":");
                    if (Number(e1Split[e1Split.length-1]) > Number(e2Split[e2Split.length-1])) return 1;
                    else if (Number(e1Split[e1Split.length-1]) < Number(e2Split[e2Split.length-1])) return -1;
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
        }
    } else return 0;
}

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

    const [selExercise, setSelExercise] = useState<ExerciseData |  undefined>(undefined);

    const filteredExercises = React.useMemo(() => {
        const baseList = allExData.filter((exercise): exercise is ExerciseData => exercise !== undefined);
        const filtered = baseList.filter((exercise) => {
            if (tags.length > 0) {
                if (!exercise.tags) return false;
                if (!tags.every((tag) => exercise.tags?.includes(tag))) return false;
            }
            if (diff !== "All" && String(exercise.difficulty) !== diff) return false;
            if (voices !== 0 && exercise.voices !== voices) return false;
            if (types !== "None" && exercise.types !== types) return false;
            if (meter !== "Anything" && String(exercise.meter) !== meter) return false;
            if (transpos && exercise.transpos !== true) return false;
            return true;
        });
        return filtered.sort(exSortFunc);
    }, [allExData, tags, diff, voices, types, meter, transpos]);

    //adding in state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; //show 5 exercises at a time
    const totalPages = Math.ceil(filteredExercises.length / pageSize);
    const safePage = Math.max(currentPage, 1);
    const startIndex = (safePage -1) * pageSize;
    const pageExercises = React.useMemo(
        () => filteredExercises.slice(startIndex, startIndex + pageSize),
        [filteredExercises, startIndex, pageSize]
    );
    const paginationStatus = totalPages === 0 ? "Loading..." : `Page ${safePage} of ${totalPages}`;

    // state for sidebar
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);

    //pagination functions, navigate between functions
    const nextPage = React.useCallback(() =>{
        if (totalPages === 0) return;
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const prevPage = React.useCallback(() => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    }, []);

    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
        } else {
            setCurrentPage((prev) => Math.min(prev, totalPages));
        }
    }, [totalPages]);

    const currentExerciseIndex = React.useMemo(() => {
        if (!selExercise) return -1;
        return filteredExercises.findIndex((exercise) => exercise.exIndex === selExercise.exIndex);
    }, [filteredExercises, selExercise]);

    useEffect(() => {
        if (filteredExercises.length === 0) {
            if (selExercise !== undefined) setSelExercise(undefined);
            return;
        }
        if (currentExerciseIndex === -1) {
            setSelExercise(filteredExercises[0]);
        }
    }, [filteredExercises, selExercise, currentExerciseIndex]);

    const navButtonsVisible = filteredExercises.length > 0 && selExercise !== undefined;
    const disablePrevNav = currentExerciseIndex <= 0;
    const disableNextNav = currentExerciseIndex === -1 || currentExerciseIndex >= filteredExercises.length - 1;

    const selectExerciseAtIndex = React.useCallback((targetIndex: number) => {
        const targetExercise = filteredExercises[targetIndex];
        if (!targetExercise) return;
        setSelExercise(targetExercise);
        setCurrentPage(Math.floor(targetIndex / pageSize) + 1);
    }, [filteredExercises, pageSize]);

    const handleTagToggle = React.useCallback((tag: string) => {
        setTags((prev) => {
            const hasTag = prev.includes(tag);
            return hasTag ? prev.filter((item) => item !== tag) : [...prev, tag];
        });
        setCurrentPage(1);
    }, []);

    const handleTransposToggle = React.useCallback(() => {
        setTranspos((prev) => !prev);
        setCurrentPage(1);
    }, []);

    const handleDifficultySelect = React.useCallback((value: string) => {
        setDiff(value);
        setCurrentPage(1);
    }, []);

    const handleVoicesSelect = React.useCallback((value: number) => {
        setVoices(value);
        setCurrentPage(1);
    }, []);

    const handleMeterSelect = React.useCallback((value: string) => {
        setMeter(value);
        setCurrentPage(1);
    }, []);

    const handleTexturalFactorSelect = React.useCallback((value: string) => {
        setTypes(value);
        setCurrentPage(1);
    }, []);

    //onClick function for when Back button is pushed under exercise
    const prevEx = React.useCallback(() => {
        if (currentExerciseIndex <= 0) return;
        selectExerciseAtIndex(currentExerciseIndex - 1);
    }, [currentExerciseIndex, selectExerciseAtIndex]);

    //onClick function for when Next button is pushed under exercise
    const nextEx = React.useCallback(() => {
        if (currentExerciseIndex === -1) return;
        if (currentExerciseIndex >= filteredExercises.length - 1) return;
        selectExerciseAtIndex(currentExerciseIndex + 1);
    }, [currentExerciseIndex, filteredExercises.length, selectExerciseAtIndex]);

    //onClick to reset all exercise sort fields
    const resetSort = function () {
        setTags([]);
        setDiff("All");
        setVoices(0);
        setTypes("None");
        setMeter("Anything");
        setTranspos(false);
        setCurrentPage(1);
        setSelExercise(undefined);
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
                    {/* --- 2. This wrapper holds your two columns side-by-side --- */} 
                    <div className = "two-column-wrapper" style={{ display: 'flex', flex: 1, gap: '20px' }}> 
            
                        {/* --- COLUMN 1: Your original 'ex-left' --- */}
                        <div className="ex-left"> {/* SIR: left column div */}
                            <h2 style={{fontSize: "1.9rem"}}>Welcome to the Exercises Page!</h2> {/*SIR: changed fontSize for consistency*/}
                            <h5 style={{fontStyle: "italic", fontSize: "1rem"}}>Sort by any of the given fields, then click an exercise to get started.</h5> {/*SIR: changed fontSize for consistency*/}

                            {filteredExercises.length === 0 ? 
                                !scoresRet ? <div>Loading scores... this process should take 2-10 seconds. <br /> If nothing changes after 10 seconds, try sorting using the above criteria.</div> : 
                            <div>No exercises with those criteria found!</div> : <></>}
                            
                            <div style={{marginTop: "8px", alignItems: "center", gap: "8px"}}>
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
                                        disabled={totalPages === 0 || currentPage >= totalPages}
                                        style={{marginLeft: "8px",fontSize: "2.5rem",
                                            background: "none",
                                            border:"none",
                                            color: totalPages === 0 || currentPage >= totalPages ? "gray" : "black",
                                            padding: "0 8px",
                                            fontWeight: "bold",
                                            lineHeight: "1"}}
                                    >
                                        ›
                                    </Button>
                                    
                                    {/* --- 1. The Toggle Button --- */}
                                    <Button
                                        onClick={toggleSidebar}
                                        variant="light"
                                        className="sidebar-toggle-button"
                                        style={{ marginBottom: "1rem", width: "fit-content", position: "relative" }}
                                    >Filters
                                    </Button>
                                </div>
                            <div style={{flex: "1", display: "flex", flexDirection: "column", minWidth:"200px"}}> {/* SIR: listed exercises, added minHeight to prevent jitter */}
                            {/* pull from paginated exercises */}
                            {pageExercises.map(function(exercise, idx){
                                const isActive = selExercise?.exIndex === exercise.exIndex;
                                const globalIndex = startIndex + idx;
                                return (
                                <div
                                    key = {exercise.title}
                                    id = {exercise.title}
                                    onClick={() => selectExerciseAtIndex(globalIndex)}
                                    role="button"
                                    aria-pressed={isActive}
                                    className={`exercise-list-item${isActive ? " active" : ""}`}>
                                    {exercise.title}
                                </div>
                                )
                            })}
                            </div>
                        </div>

                        {/* --- COLUMN 2: Your original 'ex-right' --- */}
                        <div className="ex-right"> {/*SIR: DIV tag for the loaded exercise*/}
                            <div className="exercise-viewer">
                                <div className="exercise-nav-row">
                                    <button
                                        className="exercise-nav-button exercise-nav-button--prev"
                                        id="back-btn"
                                        hidden={!navButtonsVisible}
                                        disabled={disablePrevNav}
                                        onClick={prevEx}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className="exercise-nav-button exercise-nav-button--next"
                                        id="next-btn"
                                        hidden={!navButtonsVisible}
                                        disabled={disableNextNav}
                                        onClick={nextEx}
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="exercise-content">
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
                                </div>
                            </div>
                        </div>
                    
                    </div> {/* --- End of two-column wrapper --- */}
                </div> {/* --- End of main content + button wrapper --- */}
            </div> {/* --- End of ex-page-container --- */}
        </div> // --- End of root flex container ---
    );
}
