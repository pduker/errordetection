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
    allExData: ExerciseData[];
    setAllExData: ((newData: ExerciseData[]) => void);
}) {
    return (
        <div>
            <h2>Welcome to the Exercise Management Page!</h2>
            {/*Component for uploading .musicxml files and .mp3 files, found in fileupload.tsx*/}
            <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData}files={files} setFiles ={setFiles} exIndex={0}></Exercise>
            <Exercise teacherMode={true} allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles ={setFiles} exIndex={1}></Exercise>
        </div>
    );
}