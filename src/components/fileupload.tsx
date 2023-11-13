import React, { useState, useEffect, useRef } from 'react';

export default function FileUpload (): JSX.Element {
    
    //state declarations, can be used to access file in the future
    const [file, setFile] = useState<File>();
    const [msgContent, setMsgContent] = useState<string>("Nothing selected.");
    const audioRef = useRef<HTMLAudioElement>(null);

    //sets the audio that is uploaded
    useEffect(() => {
        if (file) {
            const objectURL = URL.createObjectURL(file);
            if (audioRef.current) {
                audioRef.current.src = objectURL;
            }
            return () => {
                URL.revokeObjectURL(objectURL);
            };
        }
    }, [file]);

    //function to update state whenever uploaded file is changed
    const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) {
            setMsgContent("No file selected.");
            return;
        }
        setFile(files[0]);
        
        //checks for .musicxml and .mp3 files, if .mp3 - plays audio otherwise returns error msg  (can be easily changed)
        const selectedFile = files[0];
        if (selectedFile.name.endsWith(".mp3")) {
            setFile(selectedFile);
            setMsgContent("mp3 file selected. Preparing to play...");
        } else if (files[0].name.endsWith(".musicxml")) {
            setMsgContent("xml file selected.");
        } else {
            setMsgContent("Invalid file type! Please select a .mp3 file to play or a .musicxml.");
        }
    };

    //rendered stuff
    return (
        <div>
            <input type="file" onChange={fileChange} />
            <p>{msgContent}</p>
            <audio ref={audioRef} controls autoPlay onPlay={() => setMsgContent("Playing...")} onPause={() => setMsgContent("Paused")} onEnded={() => setMsgContent("Playback ended.")} onError={() => setMsgContent("can't play a non .mp3 file.")}>
            </audio>
        </div>
    );
};
