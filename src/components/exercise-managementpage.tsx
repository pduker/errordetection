import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';


export function ExerciseManagementPage({
    setExerciseData,
    exerciseData,
    files,
    setFiles
}:{
    files: File[];
    setExerciseData: ((newData: ExerciseData) => void);
    setFiles: ((newFiles: File[]) => void);
    exerciseData: ExerciseData | undefined;
}) {
    return (
        <div>
            <h2>Welcome to the Exercise Management Page!</h2>
            {/*Component for uploading .musicxml files and .mp3 files, found in fileupload.tsx*/}
            <Exercise teacherMode={true} setExerciseData={setExerciseData} exerciseData={exerciseData} files={files} setFiles ={setFiles}></Exercise>
        </div>
    );
}