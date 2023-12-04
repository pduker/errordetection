import React, { useState } from 'react';
import  abcjs from 'abcjs';
import { Exercise } from './exercise';
import ExerciseData from '../interfaces/exerciseData';

export function ExercisesPage({
    setExerciseData,
    exerciseData
}:{
    exerciseData: ExerciseData | undefined;
    setExerciseData: ((newData: ExerciseData) => void)
}){

    return (
        <div>
            <h2>Welcome to the Exercises Page!</h2>
            <Exercise teacherMode ={false} setExerciseData={setExerciseData} exerciseData={exerciseData}></Exercise>

        </div>

    );
}
