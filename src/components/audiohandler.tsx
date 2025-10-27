import { useEffect, useRef, useState } from 'react';

//file for handling the audio files and turning them into JSX elements that we can use on the screen
<<<<<<< HEAD
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
=======
export default function AudioHandler({ file }: { file: string | File }): JSX.Element {
  const [msgContent] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => { // on component creation, fetch audio from firebase and populate it in an audio element
    if(audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src); // if we've previously linked a URL, remove it

    if(typeof file === "string") { // file is a URL to a file
      // get the audio data as a binary blob
      getBlob(storageRef(storage, file)).then(blob => {
        const fileObject = new File([blob], file, {type: "audio/mpeg"}); // make a file out of the binary data
        const objectURL = URL.createObjectURL(fileObject); // create a URL to link it to an audio element
        if(audioRef.current) audioRef.current.src = objectURL; // set audio element's URL to the URL we just made
      });
    } else { // file is a File object
      // don't do any of that fancy new File object stuff
      const objectURL = URL.createObjectURL(file);
      if(audioRef.current) audioRef.current.src = objectURL;
>>>>>>> a417ae6393129ccf8adfa1ecdf07818dd730fa72
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
