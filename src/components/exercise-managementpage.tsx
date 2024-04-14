import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';
import { Database } from './database';
import { useEffect } from 'react';


export function ExerciseManagementPage({
    allExData,
    setAllExData
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
}) {
    const createExercise = function () {
        var last = allExData[allExData.sort(indexSort).length-1];
        if(last !== undefined) setAllExData([...allExData, new ExerciseData("", undefined, [], "", (last.exIndex) + 1, true,"Exercise " + (allExData.length+1),1,[])]);
    }

    const exSortFunc = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            try {
                if(e1.title.startsWith("Exercise ")) return 1;
                else if(e2.title.startsWith("Exercise ")) return -1;
                var e1Sorted = e1.tags.sort().length;
                var e2Sorted = e2.tags.sort().length;
                var ex = [e1Sorted, e2Sorted];
                switch (ex.toString()) {
                    case "1,1":
                    case "2,2":
                    case "3,3": 
                        break;
                    case "1,2":
                    case "1,3":
                    case "2,3":
                        return -1;
                    case "2,1":
                    case "3,1":
                    case "3,2":
                        return 1;
                    default: 
                        break;
                }
                if (e1.title > e2.title) return 1;
                else if (e1.title < e2.title) return -1;
                else {
                    if(e1.difficulty > e2.difficulty) return 1;
                    else if(e1.difficulty < e2.difficulty) return -1;
                    else return 0;
                }
            } catch {
                if(e1.title > e2.title) return 1;
                else if(e1.title < e2.title) return -1;
                else return 0;
            };
        } else return 0;
    }

    const indexSort = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            if(e1.exIndex > e2.exIndex) return 1;
            else if(e1.exIndex < e2.exIndex) return -1;
            else return 0;
        } else return 0;
    }

    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercise Management Page!</h2>
            <Button style={{color: "white", borderColor: "blue"}} onClick={createExercise}>+ New Exercise</Button>
            {allExData.sort(exSortFunc).toReversed().map(function(exercise) {
                if (exercise !== undefined)
                return (
                    <Exercise key={exercise.exIndex} teacherMode={true} ExData={exercise} allExData={allExData} setAllExData={setAllExData} exIndex={exercise.exIndex}></Exercise>
                )
                else return (<div/>
                    //<Exercise key={allExData.length} teacherMode={true} ExData={exercise} setAllExData={setAllExData} exIndex={allExData.length}></Exercise>
                )
            })}
            <br></br>
            {/* <Button onClick={fetch} variant="success">Sync with Database</Button> */}
            {/* <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData}files={files} setFiles ={setFiles} exIndex={0}></Exercise>
            <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles ={setFiles} exIndex={1}></Exercise> */}
        </div>
    );
}
