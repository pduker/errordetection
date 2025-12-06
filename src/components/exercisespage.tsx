import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { AppSidebar } from './sidebar';

const pageSize = 5; //show 5 exercises at a time

function ExerciseViewerComponent({
    navButtonsVisible,
    disablePrevNav,
    disableNextNav,
    prevEx,
    nextEx,
    selExercise,
    allExData,
    setAllExData
}: {
    navButtonsVisible: boolean;
    disablePrevNav: boolean;
    disableNextNav: boolean;
    prevEx: () => void;
    nextEx: () => void;
    selExercise: ExerciseData | undefined;
    allExData: (ExerciseData | undefined)[];
    setAllExData: (newData: (ExerciseData | undefined)[]) => void;
}) {
    return (
        <div className="exercise-viewer">
            <div className="exercise-stage">
                <div className="exercise-content"> 
                    {navButtonsVisible && (
                        <button
                            className="exercise-nav-inline exercise-nav-inline--prev"
                            onClick={prevEx}
                            disabled={disablePrevNav}
                            aria-label="Previous exercise"
                        >
                            ‹
                        </button>
                    )}
                    <div className="exercise-content-inner">
                        {selExercise !== undefined ? (
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
                        ) : (
                            <div className="exercise-placeholder">
                                <h3>No exercise loaded</h3>
                                <p>Select an exercise from the list below to begin.</p>
                            </div>
                        )}
                    </div>
                    {navButtonsVisible && (
                        <button
                            className="exercise-nav-inline exercise-nav-inline--next"
                            onClick={nextEx}
                            disabled={disableNextNav}
                            aria-label="Next exercise"
                        >
                            ›
                        </button>
                    )}
                </div> 
            </div>
        </div>
    );
}

function ExerciseQueueComponent({
    currentPage,
    setCurrentPage,
    filteredExercises,
    clearSelection,
    selExercise,
    scoresRet,
    selectExerciseAtIndex
}: {
    setCurrentPage: (currentPage: number) => void;
    currentPage: number;
    filteredExercises: ExerciseData[];
    clearSelection: () => void;
    selExercise: ExerciseData | undefined;
    scoresRet: boolean;
    selectExerciseAtIndex: (index: number) => void;
}) {
    const totalPages = Math.ceil(filteredExercises.length / pageSize);
    const safePage = Math.max(currentPage, 1);
    const startIndex = (safePage -1) * pageSize;
    const paginationStatus = totalPages === 0 ? "" : `Page ${safePage} of ${totalPages}`;

    const pageExercises = React.useMemo(
        () => filteredExercises.slice(startIndex, startIndex + pageSize),
        [filteredExercises, startIndex]
    );

    // pagination functions, navigate between functions
    const nextPage = useCallback(() => {
        if (totalPages === 0) return;
        setCurrentPage(Math.min(currentPage + 1, totalPages));
    }, [currentPage, setCurrentPage, totalPages]);

    const prevPage = useCallback(() => {
        setCurrentPage(Math.max(1, currentPage - 1));
    }, [currentPage, setCurrentPage]);

    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
        } else {
            setCurrentPage(Math.min(currentPage, totalPages));
        }
    }, [currentPage, setCurrentPage, totalPages]);

    return (
        <section className="exercise-queue-panel">
            <div className="exercise-queue-header">
                <div className="exercise-queue-nav">
                    <Button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="exercise-queue-nav-btn"
                        aria-label="Previous page of exercises"
                    >
                        ‹
                    </Button>
                    <span className="exercise-queue-status">{paginationStatus}</span>
                    <Button
                        onClick={nextPage}
                        disabled={totalPages === 0 || currentPage >= totalPages}
                        className="exercise-queue-nav-btn"
                        aria-label="Next page of exercises"
                    >
                        ›
                    </Button>
                </div>
                <Button
                    onClick={clearSelection}
                    variant="outline-secondary"
                    disabled={!selExercise}
                    className="exercise-queue-clear"
                >
                    Clear selection
                </Button>
            </div>
            <div className="exercise-queue-list">
                {filteredExercises.length === 0 ? (
                    !scoresRet ? (
                        <div className="exercise-list-empty">
                            <strong>Loading scores...</strong>
                            <span>
                                This process should take 2-10 seconds. If nothing changes after 10
                                seconds, try sorting using the above criteria.
                            </span>
                        </div>
                    ) : (
                        <div className="exercise-list-empty">
                            <strong>No exercises with those criteria found!</strong>
                        </div>
                    )
                ) : (
                    pageExercises.map(function(exercise: ExerciseData, idx: number){
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
                    })
                )}
            </div>
        </section>
    );
}

function FiltersComponent({
    tags,
    handleTagToggle,
    transpos,
    handleTransposToggle,
    diff,
    handleDifficultySelect,
    voices,
    handleVoicesSelect,
    meter,
    handleMeterSelect,
    types,
    handleTexturalFactorSelect,
    resetSort,
    resetDisabled
}: {
    tags: string[];
    handleTagToggle: (tag: string) => void;
    transpos: boolean;
    handleTransposToggle: () => void;
    diff: string;
    handleDifficultySelect: (value: string) => void;
    voices: number;
    handleVoicesSelect: (value: number) => void;
    meter: string;
    handleMeterSelect: (value: string) => void;
    types: string;
    handleTexturalFactorSelect: (value: string) => void;
    resetSort: () => void;
    resetDisabled: boolean;
}) {
    const [filtersOpen, setFiltersOpen] = useState<boolean>(true);

    return (
        <section className={`filters-panel${filtersOpen ? " filters-panel--open" : ""}`}>
            <button
                type="button"
                className="filters-panel__toggle"
                onClick={() => setFiltersOpen((prev) => !prev)}
                aria-expanded={filtersOpen}
            >
                <span>Filters</span>
                <span className="filters-panel__chevron" aria-hidden="true" />
            </button>
            <div className={`filters-panel__content${filtersOpen ? " filters-panel__content--open" : ""}`} aria-hidden={!filtersOpen}>
                <AppSidebar
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
                    resetDisabled={resetDisabled}
                />
            </div>
        </section>
    );
}

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

const LAST_SELECTED_STORAGE_KEY = "exercisesPage.lastSelectedExIndex";

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

    const currentExerciseIndex = React.useMemo(() => {
        if (!selExercise) return -1;
        return filteredExercises.findIndex((exercise) => exercise.exIndex === selExercise.exIndex);
    }, [filteredExercises, selExercise]);

    useEffect(() => {
        if (!selExercise) return;
        const stillExists = allExData.some((exercise) => exercise?.exIndex === selExercise.exIndex);
        if (!stillExists) setSelExercise(undefined);
    }, [allExData, selExercise]);

    const navButtonsVisible = filteredExercises.length > 0 && selExercise !== undefined;
    const disablePrevNav = currentExerciseIndex <= 0;
    const disableNextNav = currentExerciseIndex === -1 || currentExerciseIndex >= filteredExercises.length - 1;

    const selectExerciseAtIndex = React.useCallback((targetIndex: number) => {
        const targetExercise = filteredExercises[targetIndex];
        if (!targetExercise) return;
        setSelExercise(targetExercise);
        setCurrentPage(Math.floor(targetIndex / pageSize) + 1);
    }, [filteredExercises]);

    const clearStoredSelection = useCallback(() => {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(LAST_SELECTED_STORAGE_KEY);
    }, []);

    const clearSelection = useCallback(() => {
        clearStoredSelection();
        setSelExercise(undefined);
    }, [clearStoredSelection]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (selExercise === undefined) return;
        window.localStorage.setItem(LAST_SELECTED_STORAGE_KEY, String(selExercise.exIndex));
    }, [selExercise]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (selExercise !== undefined) return;
        const storedIndex = window.localStorage.getItem(LAST_SELECTED_STORAGE_KEY);
        if (storedIndex === null) return;
        const parsedIndex = Number(storedIndex);
        if (Number.isNaN(parsedIndex)) {
            window.localStorage.removeItem(LAST_SELECTED_STORAGE_KEY);
            return;
        }
        const targetIndex = filteredExercises.findIndex((exercise) => exercise.exIndex === parsedIndex);
        if (targetIndex !== -1) {
            selectExerciseAtIndex(targetIndex);
        }
    }, [filteredExercises, selExercise, selectExerciseAtIndex]);

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
    const prevEx = useCallback(() => {
        if (currentExerciseIndex <= 0) return;
        selectExerciseAtIndex(currentExerciseIndex - 1);
    }, [currentExerciseIndex, selectExerciseAtIndex]);

    //onClick function for when Next button is pushed under exercise
    const nextEx = useCallback(() => {
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
        clearSelection();
    }
    
    useEffect(() => {
        const savedProgress = localStorage.getItem("userProgress");
        if (savedProgress) {
        try {
            const parsed = JSON.parse(savedProgress);
            console.log("Loaded saved progress:", parsed);
        } catch (err) {
            console.error("Error parsing saved progress:", err);
        }
        }
    }, []);

    const updateProgress = (title: string | number, data: any) => {
        const current = JSON.parse(localStorage.getItem("userProgress") || "{}");
        current[title] = { ...current[title], ...data };
        localStorage.setItem("userProgress", JSON.stringify(current));
        console.log("Updated progress:", current); // check updates in console
    };



    const resetDisabled = React.useMemo(() => {
        const tagsMatchDefaults = tags.length === 0;
        return (
            tagsMatchDefaults &&
            diff === "All" &&
            voices === 0 &&
            types === "None" &&
            meter === "Anything" &&
            transpos === false
        );
    }, [tags, diff, voices, types, meter, transpos]);

    //html to render page
    return (
        <div className="fullpage">
            <div className="ex-page-container"> 
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className = "two-column-wrapper"> 
                        <div className="ex-left">
                            <FiltersComponent
                                tags={tags}
                                handleTagToggle={handleTagToggle}
                                transpos={transpos}
                                handleTransposToggle={handleTransposToggle}
                                diff={diff}
                                handleDifficultySelect={handleDifficultySelect}
                                voices={voices}
                                handleVoicesSelect={handleVoicesSelect}
                            meter={meter}
                            handleMeterSelect={handleMeterSelect}
                            types={types}
                            handleTexturalFactorSelect={handleTexturalFactorSelect}
                            resetSort={resetSort}
                            resetDisabled={resetDisabled}
                        />
                    </div>

                        <div className="ex-right">
                            <ExerciseViewerComponent
                                navButtonsVisible={navButtonsVisible}
                                disablePrevNav={disablePrevNav}
                                disableNextNav={disableNextNav}
                                prevEx={prevEx}
                                nextEx={nextEx}
                                selExercise={selExercise}
                                allExData={allExData}
                                setAllExData={setAllExData}
                            />
                            <ExerciseQueueComponent
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                filteredExercises={filteredExercises}
                                clearSelection={clearSelection}
                                selExercise={selExercise}
                                scoresRet={scoresRet}
                                selectExerciseAtIndex={selectExerciseAtIndex}
                            />
                        </div>
                    </div>
                </div>
                {exList.length === 0 ? 
                    !scoresRet ? <div>Loading scores... this process should take 2-10 seconds. If nothing changes after 10 seconds, try sorting using the above criteria.</div> : 
                <div>No exercises with those criteria found!</div> : <></>}
            </div>
            <div style={{float:'right',width:'65%', marginRight: "2vw"}}>
                {selExercise !== undefined ? <div>
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
                        updateProgress={updateProgress}
                    />
                    
                </div> : <></>}
            
            <div style={{display:"flex", justifyContent: "center"}}>
                <button  className= "btnback" id="back-btn" hidden={true} disabled={false} onClick={prevEx}>Back</button>
                <button className= "btnback" id="next-btn" hidden={true} disabled={false} onClick={nextEx}>Next</button>
            </div>
            
                
            </div>
        </div>
    );
}
