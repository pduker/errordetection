import { useEffect, useRef, useState } from 'react';


export default function AudioHandler({ file }: { file: File }): JSX.Element {
  //state declarations, can be used to access file in the future
  const [msgContent] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  //sets the audio that is uploaded
  useEffect(() => {
    if (file.name !== undefined) 
    if (file.name.endsWith(".mp3")) {
      
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
