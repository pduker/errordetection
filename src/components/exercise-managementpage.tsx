import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';


export function ExerciseManagementPage({
    
    files,
    setFiles,
    allExData,
    setAllExData
}:{
    files: File[];
    setFiles: ((newFiles: File[]) => void);
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
}) {
    const createExercise = function () {
        setAllExData([...allExData, new ExerciseData("", {}, "", allExData.length, true)]);
    }

    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercise Management Page!</h2>
            {allExData.map(function(exercise) {
                if (exercise !== undefined)
                return (
                    <Exercise teacherMode={true} allExData={allExData} setAllExData={setAllExData} files={files} setFiles={setFiles} exIndex={exercise.exIndex}></Exercise>
                )
                else return (
                    <Exercise teacherMode={true} allExData={allExData} setAllExData={setAllExData} files={files} setFiles={setFiles} exIndex={allExData.length}></Exercise>
                )
            })}
            <Button onClick={createExercise}>+ New Exercise</Button>
            {/* <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData}files={files} setFiles ={setFiles} exIndex={0}></Exercise>
            <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles ={setFiles} exIndex={1}></Exercise> */}
        </div>
    );
}