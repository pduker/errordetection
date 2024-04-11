import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import { getDatabase } from 'firebase/database';
import { ref, push, onValue, DataSnapshot } from 'firebase/database';
import React, { useState, useEffect } from 'react';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot, StorageReference } from 'firebase/storage';
import { Button } from 'react-bootstrap';

export function ExercisesPage({
    allExData,
    setAllExData,
    fetch
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    fetch: () => void;
}){
    useEffect(() => {
        fetch();
    })

      return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercises Page!</h2>
            {allExData.map(function(exercise) {
                if (exercise !== undefined)
                return (
                    <div>
                        <Exercise
                            teacherMode={false}
                            ExData={exercise}
                            allExData={allExData}
                            setAllExData={setAllExData}
                            exIndex={exercise.exIndex}
                            
                        />
                    </div>
                )
                else return <></>;
            })}
            <br></br>
            <Button variant="success" onClick={fetch}>Sync with Database</Button>
            {/* <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData}files ={files} setFiles={setFiles} exIndex={0}></Exercise>

            <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData} files ={files} setFiles={setFiles} exIndex={1}></Exercise> */}
        </div>

    );
}
