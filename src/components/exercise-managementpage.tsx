import FileUpload from './fileupload';

export function ExerciseManagementPage() {
    return (
        <div>
            <h2>Welcome to the Exercise Management Page!</h2>
            {/*Component for uploading .musicxml files and .mp3 files, found in fileupload.tsx*/}
            <FileUpload></FileUpload>
        </div>
    );
}