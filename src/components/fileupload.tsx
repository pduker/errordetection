import { useState } from 'react';
import { vertaal } from 'xml2abc';
import AudioHandler from './audiohandler';

export default function FileUpload ({
  setFile,
  setAbcFile,
  file,
  type,
  setLoaded
}:{
  file:File | undefined;
  setFile: ((newFile: File) => void);
  setAbcFile: ((newFile: string) => void) | null;
  type:string;
  setLoaded: ((newVal: boolean) => void);
}):JSX.Element{

    //state declarations, can be used to access file in the future
    const [msgContent, setMsgContent] = useState<string>(); //"Nothing selected."
    
    const abcTranslate = function (fileContent: string) {
      var domparser = new DOMParser();
      var xmldata = domparser.parseFromString(fileContent, 'application/xml');
      var options = { u:0, b:0, n:0,
      c:0, v:0, d:0,  
      m:0, x:0, t:0,  
      v1:0, noped:0,  
      stm:0,          
      p:'f', s:0 };
      //console.log(xmldata);
      var result = vertaal(xmldata, options);
      var abcText = result[0];
      //var errorText = result[1];
      if (setAbcFile != null) {
          setAbcFile(abcText);
          setLoaded(false);
          /* console.log("file? " + abcText + "<- should be here");
          console.log("error text: " + errorText); */
      }
  }

    //function to update state whenever uploaded file is changed
    const fileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
      const selectedFiles = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0) {
        //setMsgContent("No file selected.");
        return;
      }
        
        setFile(selectedFiles[selectedFiles.length-1]);
        //checks for .musicxml and .mp3 files, otherwise returns error msg (can be easily changed)
        if(type === "xml"){
          if (selectedFiles[selectedFiles.length-1].name.endsWith(".musicxml")) {
            setMsgContent("xml file selected.");
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const fileContent = fileReader.result as string;
                //console.log(fileContent);
                abcTranslate(fileContent); //logs somewhere
            }
          fileReader.readAsText(selectedFiles[selectedFiles.length-1]);
         }
          else {
            setMsgContent("Invalid file! Please select a .musicxml file");
          }
        }
        if(type === "mp3"){ 
         if (selectedFiles[selectedFiles.length-1].name.endsWith(".mp3")) {
            setMsgContent("mp3 file selected.");
          }
          else {
            setMsgContent("Invalid file! Please select a .mp3 file");
          }
        }
      };
          
        
        
  // Function to print information about uploaded files
  /* const printFileInformation = () => {
    return files.map((file, index) => (
      <div key={index}>
        <p>Name: {file.name}</p>
        <p>Size: {file.size}</p>
        <p>Type: {file.type}</p>
      </div>
    ));
  }; */

  // Function to show the file information
  // const toggleFileDisplay = () => {
  //   setShowFiles(!showFiles);
  // };

  //rendered stuff
  return (
    <div style={{display:"inline"}}>
      <input style={{display:"inline"}} type="file" onChange={fileChange} />
      {type === "mp3" && file !== undefined && file.name !== "" ? <AudioHandler file={file} /> : <p>{msgContent}</p>}
      
      {/* <button onClick={toggleFileDisplay}>
        {showFiles ? "Hide Files" : "Show Files Uploaded"}
      </button> */}
      {/* {showFiles && files.length > 0 && (
        <div>{printFileInformation()}</div>
      )} */}
    </div>
  );
}
