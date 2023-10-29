import { useState } from 'react';

export default function FileUpload (): JSX.Element{

    //state declarations, can be used to access file in the future
    const [file, setFile] = useState<File>();
    const [msgContent, setMsgContent] = useState<string>("Nothing selected.");

    //function to update state whenever uploaded file is changed
    const fileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if(!files) {
            setMsgContent("No file selected.");
            return;
        }
        setFile(files[0]);
        //checks for .musicxml and .mp3 files, otherwise returns error msg (can be easily changed)
        if (files[0].name.endsWith(".musicxml")) {
            setMsgContent("xml file selected.");
        } else if (files[0].name.endsWith(".mp3")) {
            setMsgContent("mp3 file selected.");
        } else {
            setMsgContent("Invalid file! Please select either a .musicxml or .mp3 file.");
        }
    } 

    //rendered stuff
    return (
        <div>
            <input type="file" onChange={fileChange}></input>
            <p>{msgContent}</p>
        </div>
    );
};