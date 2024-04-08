import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';
import { Database } from './database';


export function ExerciseManagementPage({
    allExData,
    setAllExData
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
}) {
    const createExercise = function () {
        setAllExData([...allExData, new ExerciseData("", undefined, [], "", allExData.length, true,"Exercise " + (allExData.length+1),1,[])]);
    }

    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercise Management Page!</h2>
            {allExData.map(function(exercise) {
                if (exercise !== undefined)
                return (
                    <Exercise key={exercise.exIndex} teacherMode={true} allExData={allExData} setAllExData={setAllExData} exIndex={exercise.exIndex}></Exercise>
                )
                else return (
                    <Exercise key={allExData.length} teacherMode={true} allExData={allExData} setAllExData={setAllExData} exIndex={allExData.length}></Exercise>
                )
            })}
            <Button onClick={createExercise}>+ New Exercise</Button>
            {/* <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData}files={files} setFiles ={setFiles} exIndex={0}></Exercise>
            <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles ={setFiles} exIndex={1}></Exercise> */}
        </div>
    );
}