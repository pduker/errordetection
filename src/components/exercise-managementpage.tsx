import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';
import { Database } from './database';
import { useEffect } from 'react';


export function ExerciseManagementPage({
    allExData,
    setAllExData,
    fetch
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    fetch: () => void;
}) {
    useEffect(() => {fetch()});
    const createExercise = function () {
        setAllExData([...allExData, new ExerciseData("", undefined, [], "", allExData.length, true,"Exercise " + (allExData.length+1),1,[])]);
    }

    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercise Management Page!</h2>
            <Button onClick={createExercise}>+ New Exercise</Button>
            {allExData.toReversed().map(function(exercise) {
                if (exercise !== undefined)
                return (
                    <Exercise key={exercise.exIndex} teacherMode={true} ExData={exercise} allExData={allExData} setAllExData={setAllExData} exIndex={exercise.exIndex}></Exercise>
                )
                else return (<div/>
                    //<Exercise key={allExData.length} teacherMode={true} ExData={exercise} setAllExData={setAllExData} exIndex={allExData.length}></Exercise>
                )
            })}
            <br></br>
            <Button onClick={fetch} variant="success">Sync with Database</Button>
            {/* <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData}files={files} setFiles ={setFiles} exIndex={0}></Exercise>
            <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles ={setFiles} exIndex={1}></Exercise> */}
        </div>
    );
}