import { useState } from 'react';
import $ from 'jquery';
//@ts-ignore
import { vertaal } from 'xml2abc';

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
            var xmldata: XMLDocument;
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const fileContent = fileReader.result as string;
                console.log("file is now string");
                xmldata = $.parseXML(fileContent);
                console.log("file is parsed");
            }
            fileReader.onloadend = () => {
                var options = { u:0, b:0, n:0,
                c:0, v:0, d:0,  
                m:0, x:0, t:0,  
                v1:0, noped:0,  
                stm:0,          
                p:'f', s:0 };
                var result = vertaal(xmldata, options);
                console.log("vertaal called");
                var abcText = result[0];
                console.log("file? " + abcText);
            };
            console.log("now reading");
            fileReader.readAsText(files[0]);

            
            // var options = { u:0, b:0, n:0,
            // c:0, v:0, d:0,  
            // m:0, x:0, t:0,  
            // v1:0, noped:0,  
            // stm:0,          
            // p:'f', s:0 };
            // var result = vertaal(xmldata, options);
            // console.log("vertaal called");
            // var abcText = result[0];
            // console.log("file? " + abcText);
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