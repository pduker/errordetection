import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';
import { getDatabase } from 'firebase/database';
import { ref, push, onValue, DataSnapshot } from 'firebase/database';
import React, { useState, useEffect } from 'react';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot, StorageReference } from 'firebase/storage';

export function ExercisesPage({
    allExData,
    setAllExData
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
}){
    const [scoresRetrieved, setScoresRetrieved] = useState<boolean>(false); // Track whether scores are retrieved
    const fetchScoresFromDatabase = async () => {
        try {
            const database = getDatabase();
            const scoresRef = ref(database, 'scores');
            onValue(scoresRef, (snapshot) => {
                const scoresData: ExerciseData[] = [];
                snapshot.forEach((childSnapshot: DataSnapshot) => {
                    const score = childSnapshot.val();
                    if (score) {
                        scoresData.push(score);
                    }
                });
                // Update state with scores retrieved from the database
                setAllExData(scoresData);
                setScoresRetrieved(true); // Set scoresRetrieved to true after retrieving scores
            });
        } catch (error) {
            console.error('Error fetching scores:', error);
            // Add additional error handling if necessary
        }
    };
    return (
        <div style={{margin: "10px"}}>
            <h2>Welcome to the Exercises Page!</h2>
            <button onClick={fetchScoresFromDatabase}>Retrieve Scores from Database</button>
            {allExData.map(function(exercise) {
                if (exercise !== undefined)
                return (
                    <div>
                        <Exercise key={exercise.exIndex} teacherMode={false} ExData={exercise} setAllExData={setAllExData} exIndex={exercise.exIndex}></Exercise>
                    </div>
                )
                else return <></>;
            })}
            {/* <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData}files ={files} setFiles={setFiles} exIndex={0}></Exercise>

            <Exercise teacherMode ={false} allExData = {allExData} setAllExData = {setAllExData} files ={files} setFiles={setFiles} exIndex={1}></Exercise> */}
        </div>

    );
}
