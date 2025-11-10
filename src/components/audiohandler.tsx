import { useEffect, useRef, useState } from 'react';

import { getBlob, getStorage, ref as storageRef } from 'firebase/storage';

const storage = getStorage();

//file for handling the audio files and turning them into JSX elements that we can use on the screen
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
    }
  }, [file]);

  return (
    <div>
      <audio ref={audioRef} controls>
      </audio>
      <p>{msgContent}</p>
    </div>
  );
}
