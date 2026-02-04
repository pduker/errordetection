import '../styles/exercises.css';
import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { get, getDatabase, ref, remove } from 'firebase/database';

//code for creating the exercise management page, seen by admin to work on updating exercises
//take in exercise data and return updated data, must be authorized users
export function ExerciseManagementPage({
    allExData,
    setAllExData,
    fetch,
    authorized
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    fetch: (val: boolean) => void;
    authorized: boolean;
}) {

    //use states for getting and setting specific attributes of exercises and music
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

    /* const [mode, setMode] = useState<boolean>(false); */

    const [diff, setDiff] = useState<string>("All");
    const [types, setTypes] = useState<string>("None");
    const [meter, setMeter] = useState<string>("Anything");
    const [voices, setVoices] = useState<number>(0);
    const [tags, setTags] = useState<string[]>([]);
    const [transpos, setTranspos] = useState<boolean>(false);

    const [exList, setExList] = useState<(ExerciseData | undefined)[]>([]);

    const [customId, setCustomId] = useState<string>("");

    //sort function for the exercises - optimized with useCallback
    const exSortFunc = useCallback(function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            try {
                //sorts exercises alphabetically
                if(e1.title.startsWith("Exercise ") && e2.title.startsWith("Exercise ")) {
                    if (e1.title > e2.title) return 1;
                    else if (e1.title < e2.title) return -1;
                    else return 0;
                }
                else if(e1.title.startsWith("Exercise ")) return -1;
                else if(e2.title.startsWith("Exercise ")) return 1;

                //compare number of tags, more tags come later (increasing order)
                // FIXED: Don't sort tags just to get length - that's very expensive!
                var e1Sorted = e1.tags.length;
                var e2Sorted = e2.tags.length;
                if (e1Sorted > e2Sorted) return 1;
                else if (e1Sorted < e2Sorted) return -1;
                else {
                    if(Number(e1.difficulty) > Number(e2.difficulty)) return 1;
                    else if(Number(e1.difficulty) < Number(e2.difficulty)) return -1;
                    else {
                        let e1Split = e1.title.split(":"), e2Split = e2.title.split(":");
                        if(Number(e1Split[e1Split.length-1]) > Number(e2Split[e2Split.length-1])) return 1;
                        else if(Number(e1Split[e1Split.length-1]) < Number(e2Split[e2Split.length-1])) return -1;
                        else {
                            //final comparison isf equal up to this point
                            if (e1.title > e2.title) return 1;
                            else if (e1.title < e2.title) return -1;
                            else return 0;
                        }
                    }
                }
                //if an error occurs default to sorting alphabetically
            } catch {
                if(e1.title > e2.title) return 1;
                else if (e1.title < e2.title) return -1;
                else return 0;
            };
            //if undefined treat as equal
        } else return 0;
    }, []);

    // Fetch exercises when component mounts
    useEffect(() => {
        console.log("ExerciseManagementPage mounted, fetching exercises...");
        if (fetch) {
            fetch(false);
        }
    }, [fetch]);

    // Update exList when allExData changes - optimized with useMemo
    const sortedExList = useMemo(() => {
        console.log("Sorting exercises:", allExData.length, "exercises");
        if (allExData.length > 0) {
            return [...allExData].sort(exSortFunc);
        }
        return [];
    }, [allExData, exSortFunc]);

    useEffect(() => {
        setExList(sortedExList);
    }, [sortedExList]);

    /* previously used when add/edit mode were separate, keeping for now for posterity
    const modeChange = function () {
        setMode(!mode);
        setDiff("All");
        setTypes("None");
        setMeter("Anything");
        setVoices(0);
        setTags([]);
        sortExercises(undefined,"");
    } */

    //main function 
    useEffect(() => {
        //if no exercises
        if(exList.length === 0) {
            if(tags.length === 0 && diff === "All" && voices === 0 && types === "None" && meter === "Anything" && !transpos) setExList(allExData.sort(exSortFunc));
        }
        //more exercises then all exercise data
        if(exList.length > allExData.length) setExList(allExData.sort(exSortFunc));
    },[exList.length, allExData, tags.length, diff, voices, types, meter, transpos, exSortFunc]);
    
    //function to allow admin to create a new exercise
    const createExercise = function () {
        var last = allExData[allExData.sort(indexSort).length-1];
        var newEx: ExerciseData;
        if(last !== undefined) newEx = new ExerciseData("", undefined, [], "", (last.exIndex) + 1, true,"Exercise " + (allExData.length+1), 1, 1, [], "None", "Anything", false, true, customId);
        else newEx = new ExerciseData("", undefined, [], "", 0, true,"Exercise " + (allExData.length+1), 1, 1, [], "None", "Anything", false, true, customId);
        newEx.isNew = true;
        setAllExData([newEx, ...allExData]);
        setExList([newEx, ...allExData]);
    }

    //function to sort exercises in the list
    const sortExercises = function (input: string | string[] | number | boolean | undefined, inputType:string) {
        var tempTags = tags, tempDiff = diff, tempVoices = voices, tempTypes = types, tempMeter = meter, tempTranspos = transpos;
        if (inputType === "tags") tempTags = input as string[];
        else if (inputType === "diff")tempDiff = input as string;
        else if (inputType === "voices") tempVoices = input as number;
        else if (inputType === "types") tempTypes = input as string;
        else if (inputType === "meter") tempMeter = input as string;
        else if (inputType === "transpos") tempTranspos = input as boolean;
        
        //filtering based on temp exercise parameters
        //copy of data to prevent messing with original data
        var list: (ExerciseData | undefined)[] = [...allExData];
        //filtering with exercise tags
        if (tempTags.length > 0) {
            list = list.filter(function(exercise) {
                if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                    return tempTags.every((element) => exercise.tags.includes(element))
                }
                else return false;})
        }
        //filtering with exercise difficulty
        if (tempDiff !== "All") {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempDiff === String(exercise.difficulty) 
                else return false;})
        }
        //filtering with exercise voices
        if (tempVoices !== 0) {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempVoices === exercise.voices
                else return false;})
        }
        //filtering with exrcise types
        if (tempTypes !== "None") {
            list = list.filter(function(exercise) {
                if (exercise !== undefined){
                    return (tempTypes === exercise.types)}
                else return false;})
        }
        //filtering with exercise meter
        if (tempMeter !== "Anything") {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return tempMeter === String(exercise.meter)
                else return false;})
        }
        //filtering with exercise transpositon, transposed instruments
        if (tempTranspos === true) {
            list = list.filter(function(exercise) {
                if (exercise !== undefined) 
                    return exercise.transpos === true;
                else return false;})
        }
        list = list.sort(exSortFunc);
        setExList(list);
    }

    //sort indexes alphabetically
    const indexSort = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            if(e1.exIndex > e2.exIndex) return 1;
            else if(e1.exIndex < e2.exIndex) return -1;
            else return 0;
        } else return 0;
    }

    //all the onClicks for when a sorting field changes
    //changing difficulty
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff((e.target.value));
        sortExercises(e.target.value,"diff");
    }
    //changing tags
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
    //changing voice
    const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setVoices(Number(e.target.value));
        sortExercises(Number(e.target.value),"voices");
    }
    //changing types
    const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>){
        setTypes(e.target.value);
        sortExercises(e.target.value,"types");
    }
    //changing meter
    const meterChange = function (e: React.ChangeEvent<HTMLSelectElement>){
        setMeter(e.target.value);
        sortExercises(e.target.value,"meter");
    }
    //changing transposition, transposed instruments
    const transposChange = function (e: React.ChangeEvent<HTMLInputElement>){
        setTranspos(!transpos);
        sortExercises(!transpos,"transpos");
    }

    //onClick to reset all exercise sort fields
    const resetSort = function () {
        //reset tags to original state
        setTags([]);

        //reset difficulty to original state
        setDiff("All");
        var diffBox = document.getElementsByName("difficulty")[0] as HTMLSelectElement;
        if (diffBox !== null) diffBox.options[0].selected = true;

        //reset voices to original state
        setVoices(0);
        var voiceBox = document.getElementsByName("voices")[0] as HTMLSelectElement;
        if (voiceBox !== null) voiceBox.options[0].selected = true;

        //reset types to original state
        setTypes("None");
        var typesBox = document.getElementsByName("types")[0] as HTMLSelectElement;
        if(typesBox !== null) typesBox.options[0].selected = true;

        //reset meter to rginal state
        setMeter("Anything");
        var meterBox = document.getElementsByName("meter")[0] as HTMLSelectElement;
        if(meterBox !== null) meterBox.options[0].selected = true;

        //reset transposition/transposed instruments to orignal state
        setTranspos(false);

        exList.sort(exSortFunc);
    }

    // function to handle selection of exercises - for deletion 
    const handleSelectExercise = (exIndex: number) => {
        const index = selectedIndexes.indexOf(exIndex);
        if (index === -1) {
            // exercise not selected - add it to the selected list
            setSelectedIndexes([...selectedIndexes, exIndex]);
        } else {
            // exercise is selected - remove from the selected list
            const updatedSelection = [...selectedIndexes];
            updatedSelection.splice(index, 1);
            setSelectedIndexes(updatedSelection);
        }
    };

    // function to handle deletion of selected exercises
    const handleMultipleExerciseDelete = async (selectedIndexes: number[]) => {
        try {
            const database = getDatabase();
    
            // delete exercises from the database
            await Promise.all(selectedIndexes.map(async (exIndex) => {
                const exerciseRef = ref(database, `scores/${exIndex}`);
                const snapshot = await get(exerciseRef);
                if (snapshot.exists()) {
                    await remove(exerciseRef);
                } else {
                    console.log('exercise' + exIndex + ' not found in the database');
                }
            }));
    
            // remove exercises from the page
            const updatedExercises = allExData.filter((exercise) => {
                return !selectedIndexes.includes(exercise?.exIndex || -1);
            });
            setAllExData(updatedExercises);
            alert("selected exercises deleted!");
            // reload the page without changing the url 
            window.location.reload();
        } catch (error) {
            console.error('error deleting exercises:', error);
            alert('error deleting exercises.');
        }
    };

    //html for the page
    console.log("ExerciseManagementPage rendering. authorized:", authorized, "allExData.length:", allExData.length);
    
    if (!authorized) {
        return <div>Unauthorized access. See help page to enter admin password for access.</div>;
    }

    return (
        <div style={{width: "90vw"}}>
            <div>
                {/*page header*/}
                <h2 style={{display:"inline"}}>Welcome to the Exercise Management Page!</h2>
            </div>
            
            {/*creating an exercise*/}
            <Button style={{display: "inline", float:"right", marginRight: "1vw"}} onClick={createExercise}>+</Button>
            <h5 style={{marginTop: "8px", fontStyle: "italic"}}>Click the + in the top right to add a new exercise, then edit as needed and save.</h5>
            
            <div>
                <h5 style={{marginLeft: "4px", marginBottom: "-20px"}}>Sort By:</h5>
                <br/>

                {/*editing an exercise, filling in all paramters*/}
                <div id="boxes" style={{ display: "inline-flex", padding: "4px" }}>
                            <form id="tags" style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                                <div style={{ fontSize: "16px", marginRight: "8px" }}>Tags:</div>
                                <label style={{ display: "flex", alignItems: "center", marginRight: "12px" }}>
                                    <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange} style={{ marginRight: "4px" }} />
                                    Pitch
                                </label>
                                <label style={{ display: "flex", alignItems: "center" }}>
                                    <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange} style={{ marginRight: "4px" }} />
                                    Intonation
                                </label>
                                <label style={{ display: "flex", alignItems: "center", marginRight: "12px" }}>
                                    <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange} style={{ marginRight: "4px" }} />
                                    Rhythm
                                </label>
                            </form>
                            <form id="transpos" style={{ display: "flex", alignItems: "center" }}>
                                <input type="checkbox" name="transpos" value="buh" checked={transpos} onChange={transposChange} style={{ marginRight: "8px" }} />
                                <div style={{ fontSize: "16px" }}>Transposing Instruments</div>
                            </form>
                        </div>

                            <br/>
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
                            
                            <div id="secondLine" style={{display: "inline-flex", padding: "4px"}}>
                                <form id="typesForm">
                                    Textural Factors:
                                    <br></br>
                                    <select name="types" onChange={typesChange}>
                                        <option value="None">None</option>
                                        <option value="Drone">Drone</option>
                                        <option value="Ensemble Parts">Ensemble Parts</option>
                                        <option value="Both">Drone & Ensemble Parts</option>
                                    </select>
                                </form>
                                <form id="customIdForm" style={{marginLeft: "10px"}}>
                                    Custom ID:
                                    <br></br>
                                    <input 
                                        type="text" 
                                        value={customId}
                                        onChange={(e) => setCustomId(e.target.value)}
                                        placeholder="Enter custom ID"
                                    />
                                </form>
                                {/*reset sort*/}
                                <Button variant="danger" onClick={resetSort} style={{marginLeft: "10px"}}>Reset Sort</Button>
                                <Button
                                    variant="danger" 
                                    onClick={() => handleMultipleExerciseDelete(selectedIndexes)} 
                                    style={{ marginLeft: "10px", marginTop: "10px" }}>
                                    Delete Selected Exercises
                                </Button>
                            </div>

                        {/*returning exercise data */}
                        {/* {exList.map((exercise) => {
                                if (exercise !== undefined)
                                    return (
                                        <Exercise
                                            key={exercise.exIndex}
                                            teacherMode={true}
                                            ExData={exercise}
                                            allExData={allExData}
                                            setAllExData={setAllExData}
                                            exIndex={exercise.exIndex}
                                            handleSelectExercise={handleSelectExercise}
                                            isSelected={selectedIndexes.includes(exercise.exIndex)}
                                            fetch={fetch}
                                        />
                                    )
                                else return (<div key={Math.random()} />);
                            })} */}
                        {exList.map((exercise) => {
                            if (!exercise) return <div key={Math.random()} />;

                            console.log("Rendering exercise:", exercise.exIndex, "isNew:", exercise.isNew);

                            return (
                                <Exercise
                                key={exercise.exIndex}
                                teacherMode={true}
                                ExData={exercise}
                                allExData={allExData}
                                setAllExData={setAllExData}
                                exIndex={exercise.exIndex}
                                handleSelectExercise={handleSelectExercise}
                                isSelected={selectedIndexes.includes(exercise.exIndex)}
                                fetch={fetch}
                                />
                            );
                        })}

            {exList.length === 0 ? <div>No exercises found! Maybe try adding one?</div> : <></>}

        </div>
    </div>
);
}
