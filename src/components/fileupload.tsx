import React, { useState } from 'react';
import AudioHandler from './audiohandler';

// FileInfo class - stores file details and the original file
class FileInfo {
  name: string;
  size: number;
  type: string;
  originalFile: File;

  constructor(file: File) {
    this.name = file.name;
    this.size = file.size;
    this.type = file.type;
    this.originalFile = file;
  }
}

export default function FileUpload(): JSX.Element {
  //state declarations, can be used to access file in the future
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [msgContent, setMsgContent] = useState("Nothing selected.");
  const [showFiles, setShowFiles] = useState(false);

  //function to update state whenever uploaded file is changed
  const fileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setMsgContent("No file selected.");
      return;
    }

    // creates a new FileInfo object and updates the state
    const newFileInfo = new FileInfo(selectedFiles[0]);
    setFiles([...files, newFileInfo]);

     //checks for .musicxml and .mp3 files, otherwise returns error msg (can be easily changed)
    if (selectedFiles[0].name.endsWith(".musicxml")) {
      setMsgContent("xml file selected.");
    } else if (selectedFiles[0].name.endsWith(".mp3")) {
      setMsgContent("mp3 file selected.");
    } else {
      setMsgContent("Invalid file! Please select either a .musicxml or .mp3 file.");
    }
  };

  // Function to print information about uploaded files
  const printFileInformation = () => {
    return files.map((file, index) => (
      <div key={index}>
        <p>Name: {file.name}</p>
        <p>Size: {file.size}</p>
        <p>Type: {file.type}</p>
      </div>
    ));
  };

  // Function to show the file information
  const toggleFileDisplay = () => {
    setShowFiles(!showFiles);
  };

  //rendered stuff
  return (
    <div>
      <input type="file" onChange={fileChange} />
      <p>{msgContent}</p>
      <AudioHandler files={files} />
      <button onClick={toggleFileDisplay}>
        {showFiles ? "Hide Files" : "Show Files Uploaded"}
      </button>
      {showFiles && files.length > 0 && (
        <div>{printFileInformation()}</div>
      )}
    </div>
  );
}
