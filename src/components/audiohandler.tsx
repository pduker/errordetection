import { useEffect, useRef, useState } from 'react';

//file for handling the audio files and turning them into JSX elements that we can use on the screen
export default function AudioHandler({ file }: { file: File }): JSX.Element {
  //state declarations, can be used to access file in the future
  const [msgContent] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  //sets the audio file that is uploaded
  useEffect(() => {
    if (file.name !== undefined) 
    if (file.name.endsWith(".mp3")) {
      
      //creates an object url given the file, alows us to actually use the audio content
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
            <audio ref={audioRef} controls>
            </audio>
            <p>{msgContent}</p>
        </div>
  );
}
