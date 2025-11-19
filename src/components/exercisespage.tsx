import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { set } from 'firebase/database';

const pageSize = 5; // show 5 exercises at a time

function TagCheckbox({
    value,
    tags,
    setTags
}: {
    value: string,
    tags: string[],
    setTags: (tags: string[]) => void
}) {
    return (
        <label style={{ display: "flex", alignItems: "center", marginRight: "12px" }}>
            <input
                type="checkbox"
                name="tags"
                value={value}
                checked={tags.includes(value)}
                onChange={() => setTags(updateTags(tags, value))}
                style={{ marginRight: "4px" }}
            />
            {value}
        </label>
    )
}

function updateTags(oldTags: string[], tagName: string): string[] {
    if(oldTags.includes(tagName)) return oldTags.toSpliced(oldTags.indexOf(tagName), 1); // remove tag from tags array
    else return [...oldTags, tagName]; // add tag to array
}

function getPaginatedExercises(allExData: ExerciseData[], currentPage: number): ExerciseData[] {
    return allExData.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
}

// TODO copied from the old codebase, we should DEFINITELY implement an easier comparator
// used as the comparison function for a sort call
function exerciseComparisonFunction(e1: ExerciseData, e2: ExerciseData): number {
    // exercises starting with "Exercise " go first
    if(e1.title.startsWith("Exercise ") && !e2.title.startsWith("Exercise ")) return 1;
    else if(e2.title.startsWith("Exercise ") && !e1.title.startsWith("Exercise ")) return -1;

    // exercises with more tags go first
    const e1TagLength = e1.tags.length;
    const e2TagLength = e2.tags.length;
    if(e1TagLength > e2TagLength) return 1;
    else if(e2TagLength > e1TagLength) return -1;

    // more difficult exercises go first
    if(e1.difficulty > e2.difficulty) return 1;
    else if(e2.difficulty > e1.difficulty) return 1;

    // sort by number in title
    const e1Split = e1.title.split(":").pop();
    const e2Split = e2.title.split(":").pop();
    if(Number(e1Split) > Number(e2Split)) return 1;
    else if(Number(e2Split) > Number(e1Split)) return -1;

    // last sort, just sort by title length
    if(e1.title > e2.title) return 1;
    else return -1;
}

export function ExercisesPage({
    allExData,
    setAllExData,
    defaultTags = []
}:{
    allExData: ExerciseData[];
    setAllExData: (newData: ExerciseData[]) => void;
    defaultTags?: string[];
}){
    // exercise filters
    const [tags, setTags] = useState<string[]>(defaultTags);
    const [difficulty, setDifficulty] = useState<number>(0);
    const [voices, setVoices] = useState<number>(0);
    const [meter, setMeter] = useState<string>("Any");
    const [texturalFactors, setTexturalFactors] = useState<string>("Any");

    const [searchParams, setSearchParams] = useSearchParams();

    // pagination state
    const [currentPage, setCurrentPage] = useState(0);

    //function is executed whenever any of the filter states change
    const sortedExercises: ExerciseData[] = useMemo(() => {
        const filterTransposition = tags.includes("Transposition");
        const tagsWithoutTransposition = filterTransposition ? updateTags(tags, "Transposition") : tags;

        const sortedExData = [...allExData].filter(exercise => {
            if(!tagsWithoutTransposition.every(tag => exercise.tags.includes(tag))) return false; // ensure all selected tags are inside the exercise's tags
            if(filterTransposition && !exercise.transpos) return false; // filter transposition
            if(difficulty !== 0 && exercise.difficulty !== difficulty) return false;
            if(voices !== 0 && exercise.voices !== voices) return false;
            if(texturalFactors !== "Any" && exercise.types !== texturalFactors) return false;
            if(meter !== "Any" && exercise.meter !== meter) return false;

            return true;
        }).toSorted(exerciseComparisonFunction);

        setCurrentPage(0);

        return sortedExData;
    }, [tags, difficulty, voices, meter, texturalFactors, allExData]);

    //weird glitch where the tags checkboxes don't update the URL properly - fix later
    useEffect(() => {
        // update URL parameters based on filter states
        setSearchParams({
            difficulty: difficulty.toString(),
            voices: voices.toString(),
            tags: tags.join(','),
            meter: meter,
        });
    }, [tags, difficulty, voices, meter, setSearchParams]);


    useEffect(() => {
        // update filters based on URL parameters
        const difficultyParam = searchParams.get('difficulty');
        const voicesParam = searchParams.get('voices');
        const tagsParam = searchParams.get('tags');
        const meterParam = searchParams.get('meter');

        //these call the sort function multiple times - fix later
        setDifficulty(difficultyParam ? Number(difficultyParam) : 0);
        setVoices(voicesParam ? Number(voicesParam) : 0);
        setMeter(meterParam ? meterParam : "Any");
        const newTags = tagsParam ? tagsParam.split(',') : [];
        setTags(newTags);
    }, [searchParams]);

    const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);

    function resetSort() {
        setTags([]);
        setDifficulty(0);
        setVoices(0);
        setTexturalFactors("Any");
        setMeter("Any");
    }

    function changeExercise(event: React.MouseEvent<HTMLSpanElement>) {
        setSelectedExercise(allExData.find(exercise => exercise.title === (event.target as Element).id) || null);
    }

    function previousExercise() {
        if(selectedExercise === null) return;
        const currentIndex = sortedExercises.indexOf(selectedExercise);
        // if sortedExercises doesn't match selectedExercise (such as if you change the tags), set to first exercise
        setSelectedExercise(sortedExercises[currentIndex === -1 ? 0 : currentIndex - 1]);
    }

    function nextExercise() {
        if(selectedExercise === null) return;
        const currentIndex = sortedExercises.indexOf(selectedExercise);
        setSelectedExercise(sortedExercises[currentIndex === -1 ? 0 : currentIndex + 1]);
    }

    return (
        <div style={{ width: "90vw", marginTop: "10px" }}>
            <div>
                <h2>Welcome to the Exercises Page!</h2>
            </div>

            <h5 style={{fontStyle: "italic"}}>Sort by any of the given fields, then click an exercise to get started.</h5>

            <div style={{float:'left', width: "30%"}}>
                <span>
                    <div id="boxes" style={{ display: "inline-flex", padding: "4px" }}>
                        <form id="tags" style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                            <div style={{ fontSize: "16px", marginRight: "8px" }}>Tags:</div>
                            <TagCheckbox value={"Pitch"} tags={tags} setTags={setTags}/>
                            <TagCheckbox value={"Intonation"} tags={tags} setTags={setTags}/>
                            <TagCheckbox value={"Rhythm"} tags={tags} setTags={setTags}/>
                            <TagCheckbox value={"Transposition"} tags={tags} setTags={setTags}/>
                        </form>
                    </div>

                    <div id="dropdowns" style={{display: "inline-flex", padding: "4px"}}>
                        <form id="difficulty">
                            <div style={{fontSize:"16px", display:"inline"}}>Difficulty:</div>
                            <br/>
                            <select name="difficulty" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>
                                <option value={0}>All</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                        </form>
                        <form id="voiceCt">
                            Voices:
                            <br/>
                            <select name="voices" value={voices} onChange={e => setVoices(Number(e.target.value))}>
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
                            <br/>
                            <select name='meter' value={meter} onChange={e => setMeter(e.target.value)}>
                                <option value="Any">Any</option>
                                <option value="Simple">Simple</option>
                                <option value="Compound">Compound</option>
                            </select>
                        </form>
                    </div>

                    <div style={{display: "inline-flex", padding: "4px"}}>
                        <form id="texturalFactorsForm">
                            Textural Factors:
                            <br/>
                            <select name="texturalFactors" value={texturalFactors} onChange={e => setTexturalFactors(e.target.value)}>
                                <option value="Any">Any</option>
                                <option value="Drone">Drone</option>
                                <option value="Ensemble Parts">Ensemble Parts</option>
                                <option value="Both">Drone & Ensemble Parts</option>
                            </select>
                        </form>
                        <Button variant="danger" onClick={resetSort} style={{marginLeft: "8px"}}>Reset Sort</Button>
                    </div>
                </span>

                {
                    getPaginatedExercises(sortedExercises, currentPage).map(exercise => {
                        return (
                            <div
                                key={exercise.title}
                                id={exercise.title}
                                onClick={changeExercise}
                                style={{margin: "8px", padding: "6px", cursor: "pointer", backgroundColor: "#fcfcd2", borderRadius: "2px"}}
                            >
                                {exercise.title}
                            </div>
                        );
                    })
                }

                <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
                        disabled={currentPage <= 0}
                        style={{
                        marginRight: "8px",
                        fontSize: "2.5rem",
                        background: "none",
                        border:"none",
                        color: currentPage <= 0 ? "gray" : "black",
                        padding: "0 8px",
                        fontWeight: "bold",
                        lineHeight: "1"}}
                    >
                        <span>←</span>
                    </Button>
                    <span> Page {currentPage + 1} of {Math.ceil(sortedExercises.length / pageSize)} </span>
                    <Button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(sortedExercises.length / pageSize)))}
                        disabled={currentPage + 1 >= Math.ceil(sortedExercises.length / pageSize)}
                        style={{marginLeft: "8px",fontSize: "2.5rem",
                        background: "none",
                        border:"none",
                        color: currentPage + 1 >= Math.ceil(sortedExercises.length / pageSize) ? "gray" : "black",
                        padding: "0 8px",
                        fontWeight: "bold",
                        lineHeight: "1"}}
                    >
                        <span>→</span>
                    </Button>
                </div>
                    {
                        allExData.length === 0 ? <div>Loading scores...</div> : sortedExercises.length === 0 ? <div>No exercises with those criteria found!</div> : <></>
                    }
            </div>
            <div style={{ float: "right", width: "65%", marginRight: "2vw"}}>
                {
                    selectedExercise ?
                        <div>
                            <div>
                                <Exercise
                                    key={selectedExercise.exIndex}
                                    teacherMode={false}
                                    ExData={selectedExercise}
                                    allExData={allExData}
                                    setAllExData={setAllExData} //error here but the site still compiles - fix later
                                    handleSelectExericse={undefined}
                                    exIndex={selectedExercise.exIndex}
                                    isSelected={undefined}
                                    fetch={undefined}
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <button className="btnback" id="back-btn" disabled={sortedExercises.indexOf(selectedExercise) === 0} onClick={previousExercise}>Back</button>
                                <button className="btnback" id="back-btn" disabled={sortedExercises.indexOf(selectedExercise) === sortedExercises.length - 1} onClick={nextExercise}>Next</button>
                            </div>
                        </div> :
                        <></>
                }
            </div>
            <br/>
        </div>
    );
}
