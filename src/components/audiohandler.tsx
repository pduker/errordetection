import React, { useEffect, useRef, useState } from 'react';

export default function AudioHandler({ file }: { file: File | undefined }): JSX.Element {
    //state declarations, can be used to access file in the future
    const [msgContent, setMsgContent] = useState<string>("");
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

    //plays the audio that is uploaded 
    return (
        <div>
            <audio ref={audioRef} controls onPlay={() => setMsgContent("Playing...")} onPause={() => setMsgContent("Paused")} onEnded={() => setMsgContent("Playback ended.")} onError={() => setMsgContent("Can't play a non .mp3 file.")}>
            </audio>
            <p>{msgContent}</p>
        </div>
    );
}