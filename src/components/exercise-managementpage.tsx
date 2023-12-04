import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';
import { FileUpload } from './fileupload';

export function ExerciseManagementPage({
    setExerciseData
}:{
    setExerciseData: ((newData: ExerciseData) => void)
}) {
    return (
        <div>
            <h2>Welcome to the Exercise Management Page!</h2>
            {/*Component for uploading .musicxml files and .mp3 files, found in fileupload.tsx*/}
            <Exercise teacherMode={true} setExerciseData={setExerciseData} exerciseData={undefined}></Exercise>
        </div>
    );
}