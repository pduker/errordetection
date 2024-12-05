import React, { useEffect, useState } from "react";
import { ref, get, remove, child, set } from "firebase/database";
import abcjs from "abcjs";
import FileUpload from "./fileupload";
import ExerciseData from "../interfaces/exerciseData";
import DBData from "../interfaces/DBData";
import AudioHandler from "./audiohandler";
import { getDatabase } from "firebase/database";
import { Button } from "react-bootstrap";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { initializeApp } from "firebase/app";
import noteKey from "../assets/note-color-key.png";
import { updateMethodSignature } from "typescript";

const firebaseConfig = {
  apiKey: "AIzaSyClKDKGi72jLfbtgWF1957XHWZghwSM0YI",
  authDomain: "errordetectinator.firebaseapp.com",
  databaseURL: "https://errordetectinator-default-rtdb.firebaseio.com",
  projectId: "errordetectinator",
  storageBucket: "errordetectinator.appspot.com",
  messagingSenderId: "442966541608",
  appId: "1:442966541608:web:b08d5b8a9ea1d5ba2ffc1d",
};
const app = initializeApp(firebaseConfig);

// Export initialized Firebase app
export const firebaseApp = app;

export function Exercise({
  exIndex,
  teacherMode,
  ExData,
  allExData,
  setAllExData,
  handleSelectExercise,
  isSelected,
  fetch,
}: {
  exIndex: number;
  teacherMode: boolean;
  ExData: ExerciseData;
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  handleSelectExercise: ((exIndex: number) => void) | undefined;
  isSelected: boolean | undefined;
  fetch: ((val: boolean) => void) | undefined;
}) {
  //for score styling
  const score = {
    display: "inline-block",
    margin: "auto",
    backgroundColor: "white",
    borderRadius: "10px",
    width: "100%",
  };

  // lots of variable initialization
  var abc = "",
    feed = "",
    color: string;
  var ans: any[] = [];
  var visualObjs: any;
  var exerciseData = ExData;
  var exInd = exIndex;
  var title = "";
  var tagsInit: string[] = [];
  var diffInit = 1;
  var voicesInit = 1;
  var mp3: File = new File([], "");
  var typesInit = "None";
  var meterInit = "Anything";
  var transposInit = false;

  // writing into above variables with info from exerciseData
  if (exerciseData !== undefined) {
    if (exerciseData.score !== undefined) abc = exerciseData.score;
    if (exerciseData.sound !== undefined) mp3 = exerciseData.sound;
    if (exerciseData.correctAnswers !== undefined)
      ans = exerciseData.correctAnswers;
    //if(exerciseData.feedback !== undefined) feed = exerciseData.feedback;
    if (exerciseData.title !== undefined) title = exerciseData.title;
    if (exerciseData.tags !== undefined) tagsInit = exerciseData.tags;
    if (exerciseData.difficulty !== undefined)
      diffInit = exerciseData.difficulty;
    if (exerciseData.voices !== undefined) voicesInit = exerciseData.voices;
    if (exerciseData.types !== undefined) typesInit = exerciseData.types;
    if (exerciseData.meter !== undefined) meterInit = exerciseData.meter;
    if (exerciseData.transpos !== undefined)
      transposInit = exerciseData.transpos;
  }

  // lots of state init
  const [loaded, setLoaded] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [ana, setAna] = useState<string>();
  const [customTitle, setCustomTitle] = useState<string>(title);
  const [customFeedback, setCustomFeedback] = useState<string[]>([]);
  const [lastClicked, setLastClicked] = useState<any>();

  const [diff, setDiff] = useState<number>(diffInit);
  const [tags, setTags] = useState<string[]>(tagsInit);
  const [voices, setVoices] = useState<number>(voicesInit);
  const [types, setTypes] = useState<string>(typesInit);
  const [meter, setMeter] = useState<string>(meterInit);
  const [transpos, setTranspos] = useState<boolean>(transposInit);

  const [selNotes, setSelNotes] = useState<any[]>([]);
  const [selAnswers, setSelAnswers] = useState<any[]>([]);
  const [correctAnswers, setCorrectAnswers] =
    useState<{ [label: string]: number | string }[]>(ans);

  const [xmlFile, setXmlFile] = useState<File>();
  const [mp3File, setMp3File] = useState<File>(mp3);
  const [abcFile, setAbcFile] = useState<string>(abc);

  // tries to load score when there's either exerciseData or an abc file to pull from
  useEffect(() => {
    if (
      (exerciseData !== undefined && !exerciseData.empty && !loaded) ||
      (abcFile !== undefined && abcFile !== "" && !loaded)
    )
      loadScore();
  });

  // yoinked/edited from abcjs! probably don't need all of it for highlighting but oh well
  const setClass = function (
    elemset: any,
    addClass: any,
    removeClass: any,
    color: any
  ) {
    if (!elemset) return;
    for (var i = 0; i < elemset.length; i++) {
      var el = elemset[i];
      var attr = el.getAttribute("highlight");
      if (!attr) attr = "fill";
      el.setAttribute(attr, color);
      var kls = el.getAttribute("class");
      if (!kls) kls = "";
      kls = kls.replace(removeClass, "");
      kls = kls.replace(addClass, "");
      if (addClass.length > 0) {
        if (kls.length > 0 && kls[kls.length - 1] !== " ") kls += " ";
        kls += addClass;
      }
      el.setAttribute("class", kls);
    }
  };

  // yoinked/edited from abcjs! changed behavior so it works how we want it to B)
  const highlight = function (note: any, klass: any, clicked: boolean): number {
    var retval = 0;
    var selTim = Number(note.abselem.elemset[0].getAttribute("selectedTimes"));
    if (clicked) selTim++;
    if (selTim >= 3) {
      selTim = 0;
      selNotes.splice(selNotes.indexOf(note), 1);
      selAnswers.splice(selAnswers.indexOf(note), 1);
      retval = 1;
    }
    if (klass === undefined) klass = "abcjs-note_selected";
    if (selTim <= 0) {
      color = "#000000";
    }
    if (selTim === 1) {
      color = "#ff6100"; //was red - ff0000, now orange - ff6100
    }
    /* if (selTim == 2) {
            color = "#dc267f"; //was blue - 00ff00, now magenta - dc267f
        } */
    if (selTim === 2) {
      color = "#648fff"; //was green - 0000ff, now blue - 648fff
    }
    if (clicked) note.abselem.elemset[0].setAttribute("selectedTimes", selTim);
    setClass(note.abselem.elemset, klass, "", color);
    //console.log(note);
    return retval;
  };

  // handles notes when they are clicked on: selects them and highlights them
  const clickListener = function (
    abcelem: any,
    tuneNumber: number,
    classes: string,
    analysis: abcjs.ClickListenerAnalysis,
    drag: abcjs.ClickListenerDrag
  ) {
    var note = abcelem;
    var noteElems = note.abselem.elemset[0];

    // selected notes handling
    if (teacherMode) {
      if (!selNotes.includes(note)) {
        selNotes.push(note);
      }
      for (var i = 0; i < selNotes.length; i++) {
        if (selNotes[i] === note) {
          if (highlight(selNotes[i], undefined, true) === 1) i--;
        } else {
          if (highlight(selNotes[i], undefined, false) === 1) i--;
        }
      }
      // this state set doesn't seem to be necessary? leaving in for posterity/just in case it becomes necessary
      //setSelNotes([...selNotes]);
    }
    // selected notes handling: non-teacher edition (that means it's called selected ANSWERS now)
    else {
      if (!selAnswers.includes(note)) {
        selAnswers[selAnswers.length] = note;
      }
      for (var j = 0; j < selAnswers.length; j++) {
        if (selAnswers[j] === note) {
          if (highlight(selAnswers[j], undefined, true) === 1) j--;
        } else {
          if (highlight(selAnswers[j], undefined, false) === 1) j--;
        }
      }
      setSelAnswers([...selAnswers]);
    }

    // gets the position of the note and adds it to Ana (used on mng view to show note info)
    var staffCt = Number(noteElems.getAttribute("staffPos")) + 1,
      measureCt = Number(noteElems.getAttribute("measurePos")) + 1;
    setAna("Staff " + staffCt + ", measure " + measureCt);

    // lastClicked used to save unique note feedback
    setLastClicked(note);
    var txt = document.getElementById("note-feedback-" + exIndex);
    if (txt !== null && "value" in txt)
      txt.value = noteElems.getAttribute("feedback");
    if (teacherMode) multiAnswer();
  };

  // function that runs once a valid abc score has been detected: loads the abc, adds note attrs, and highlights correct answers on mng page
  const loadScore = function () {
    // sample file: "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3"
    var abcString = abcFile;

    // removing extra unimportant stuff from abc string
    abcString = abcString.replace("Z:Copyright ©\n", "");
    abcString = abcString.replace("T:Title\n", "");
    var el = document.getElementById("target" + exIndex);
    if (el !== null && abcString !== undefined) {
      // the render itself
      visualObjs = abcjs.renderAbc(el, abcString, {
        clickListener: clickListener,
        selectTypes: ["note"],
        lineThickness: 0.4,
        responsive: "resize",
      });

      let beatSum: number = 0;
      let noteCount: number = 0;
      let barStartX = 0;
      let created = false;
      let remainLen = 0;

      const svgElement = document.querySelector("svg");
      const boundingBox: DOMRect | undefined =
        svgElement?.getBoundingClientRect();

      // adds staff #, measure #, index, selectedTimes of 0, and empty feedback to each note when the score is first loaded
      var staffArray = visualObjs[0].lines[0].staff;

      for (
        let i = 0, j = 0, staff = 0, measure = 0;
        staff < staffArray.length;
        i++, j++
      ) {
        var note = staffArray[staff].voices[0][j];
        var noteElems = staffArray[staff].voices[0][j].abselem.elemset[0];
        if (note.el_type === "bar") {
          measure++;
          i--;
        } else {
          if (!noteElems.getAttribute("staffPos"))
            noteElems.setAttribute("staffPos", staff);
          if (!noteElems.getAttribute("measurePos"))
            noteElems.setAttribute("measurePos", measure);
          if (!noteElems.getAttribute("feedback"))
            noteElems.setAttribute("feedback", "");
          if (!noteElems.getAttribute("index"))
            noteElems.setAttribute("index", i);
          if (!noteElems.getAttribute("selectedTimes"))
            noteElems.setAttribute("selectedTimes", 0);
        }
        if (j + 1 === staffArray[staff].voices[0].length) {
          staff++;
          j = -1;
          measure = 0;
        }

        //create bar when it is rhythm exercise
        if (tags.includes("Rhythm")) {
          if (!boundingBox) {
            return;
          }

          //save the starting point of the beat
          if (beatSum === 0) {
            barStartX = noteElems.getBoundingClientRect().left;
          }

          if (typeof note.duration === "number" && !isNaN(note.duration)) {
            beatSum += note.duration;
            noteCount++;
          }

          const topLines = svgElement?.querySelectorAll(".abcjs-top-line");
          let totalSum: number = 0;

          //when note is longer than a beat
          if (beatSum > visualObjs[0].getBeatLength()) {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.position = "absolute";

            const coverBox = document.createElement("div");
            coverBox.classList.add("cover-box");
            coverBox.style.position = "absolute";

            if (topLines) {
              if (topLines[staff]) {
                const topBox = topLines[staff].getBoundingClientRect();
                bar.style.top = topBox.top - boundingBox.top - 10 + "px";
              }
            }

            if (
              Math.floor(beatSum / visualObjs[0].getBeatLength()) ===
              beatSum / visualObjs[0].getBeatLength()
            ) {
              bar.style.width =
                (noteElems.nextSibling.getBoundingClientRect().left -
                  barStartX) *
                  (1 / (beatSum / visualObjs[0].getBeatLength())) -
                5 +
                "px";
            } else {
              bar.style.width =
                ((noteElems.nextSibling.getBoundingClientRect().left -
                  noteElems.getBoundingClientRect().left) *
                  2) /
                  3 +
                "px";
              remainLen =
                ((noteElems.nextSibling.getBoundingClientRect().left -
                  noteElems.getBoundingClientRect().left) *
                  1) /
                3;
            }

            bar.style.left = barStartX - boundingBox.left + "px";
            bar.style.height = "5px";
            bar.style.backgroundColor = "blue";
            bar.style.opacity = "0.2";

            coverBox.style.top = bar.style.top;
            coverBox.style.left = bar.style.left;
            coverBox.style.width = bar.style.width;
            coverBox.style.height =
              boundingBox.height / 2 / staffArray.length + "px";
            coverBox.style.backgroundColor = "blue";
            coverBox.style.opacity = "0";
            coverBox.style.pointerEvents = "none";

            bar.addEventListener("mouseenter", () => {
              if (bar.style.opacity === "0.2") {
                bar.style.opacity = "0.5";
              }
            });
            bar.addEventListener("mouseleave", () => {
              if (bar.style.opacity !== "1") {
                bar.style.opacity = "0.2";
              }
            });

            bar.addEventListener("click", () => {
              if (bar.style.opacity === "0.5") {
                bar.style.opacity = "1";
                coverBox.style.opacity = "0.5";

                const noteToSelect = staffArray[staff].voices[0][j];
                if (!selAnswers.includes(noteToSelect)) {
                  selAnswers.push(noteToSelect);
                }
                noteToSelect.abselem.elemset[0].setAttribute(
                  "selectedTimes",
                  3
                );
              } else if (bar.style.opacity === "1") {
                bar.style.opacity = "0.2";
                coverBox.style.opacity = "0";

                const noteToSelect = staffArray[staff].voices[0][j];

                const answerIndex = selAnswers.indexOf(noteToSelect);
                if (answerIndex !== -1) {
                  selAnswers.splice(answerIndex, 1);
                }
                noteToSelect.abselem.elemset[0].setAttribute(
                  "selectedTimes",
                  0
                );
              }
            });

            // Append the bar and coverBox to the appropriate parent element
            const parentElement = document.getElementById("target" + exIndex);
            if (parentElement) {
              parentElement.style.position = "relative";
              parentElement.appendChild(bar);
              parentElement.appendChild(coverBox);
            }

            //reset beatSum
            totalSum = beatSum;
            beatSum -= visualObjs[0].getBeatLength();
            noteCount = 0;
            created = true;
          }

          //create bar and coverbox by beat
          if (beatSum === visualObjs[0].getBeatLength()) {
            const currentCount = noteCount;

            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.position = "absolute";

            const coverBox = document.createElement("div");
            coverBox.classList.add("cover-box");
            coverBox.style.position = "absolute";

            if (topLines) {
              if (topLines[staff]) {
                const topBox = topLines[staff].getBoundingClientRect();
                bar.style.top = topBox.top - boundingBox.top - 10 + "px";
              }
            }

            if (created) {
              if (note.duration < beatSum) {
                bar.style.left =
                  noteElems.getBoundingClientRect().left -
                  boundingBox.left -
                  remainLen +
                  5 +
                  "px";
                bar.style.width =
                  noteElems.nextSibling.getBoundingClientRect().left -
                  noteElems.getBoundingClientRect().left +
                  remainLen -
                  5 +
                  "px";
                bar.style.backgroundColor = "blue";
              } else {
                bar.style.width =
                  (noteElems.nextSibling.getBoundingClientRect().left -
                    barStartX) /
                    Math.round(totalSum / visualObjs[0].getBeatLength()) -
                  5 +
                  "px";
                bar.style.left =
                  barStartX -
                  boundingBox.left +
                  (noteElems.nextSibling.getBoundingClientRect().left -
                    barStartX) /
                    (totalSum / visualObjs[0].getBeatLength()) +
                  "px";
                bar.style.backgroundColor = "blue";
              }
              created = false;
            } else {
              bar.style.left = barStartX - boundingBox.left + "px";
              bar.style.width =
                noteElems.nextSibling.getBoundingClientRect().left -
                barStartX -
                5 +
                "px";
              bar.style.backgroundColor = "blue";
              created = false;
            }

            bar.style.height = "5px";
            // bar.style.backgroundColor = "blue";
            bar.style.opacity = "0.2";

            coverBox.style.top = bar.style.top;
            coverBox.style.left = bar.style.left;
            coverBox.style.width = bar.style.width;
            coverBox.style.height =
              boundingBox.height / 2 / staffArray.length + "px";
            coverBox.style.backgroundColor = "blue";
            coverBox.style.opacity = "0";
            coverBox.style.pointerEvents = "none";

            bar.addEventListener("mouseenter", () => {
              if (bar.style.opacity === "0.2") {
                bar.style.opacity = "0.5";
              }
            });
            bar.addEventListener("mouseleave", () => {
              if (bar.style.opacity !== "1") {
                bar.style.opacity = "0.2";
              }
            });

            bar.addEventListener("click", () => {
              if (bar.style.opacity === "0.5") {
                bar.style.opacity = "1";
                coverBox.style.opacity = "0.5";
                for (let p = 0; p < currentCount; p++) {
                  const noteToSelect = staffArray[staff].voices[0][j - p];
                  if (!selAnswers.includes(noteToSelect)) {
                    selAnswers.push(noteToSelect);
                  }
                  noteToSelect.abselem.elemset[0].setAttribute(
                    "selectedTimes",
                    3
                  );
                }
              } else if (bar.style.opacity === "1") {
                bar.style.opacity = "0.2";
                coverBox.style.opacity = "0";
                for (let p = 0; p < currentCount; p++) {
                  const noteToSelect = staffArray[staff].voices[0][j - p];
                  const answerIndex = selAnswers.indexOf(noteToSelect);
                  if (answerIndex !== -1) {
                    selAnswers.splice(answerIndex, 1);
                  }
                  noteToSelect.abselem.elemset[0].setAttribute(
                    "selectedTimes",
                    0
                  );
                }
              }
            });

            // Append the bar and coverBox to the appropriate parent element
            const parentElement = document.getElementById("target" + exIndex);
            if (parentElement) {
              parentElement.style.position = "relative";
              parentElement.appendChild(bar);
              parentElement.appendChild(coverBox);
            }

            //reset beatSum
            beatSum = 0;
            noteCount = 0;
          }
        }

        // rehighlights correct answers on mng page for ex editing purposes
        if (teacherMode) {
          var ansSearch = correctAnswers.findIndex(
            (answer: { [label: string]: string | number }) =>
              answer.index === noteElems.getAttribute("index") &&
              note.el_type !== "bar"
          );
          if (ansSearch !== -1) {
            // sets attributes to their proper values
            noteElems.setAttribute(
              "selectedTimes",
              correctAnswers[ansSearch].selectedTimes
            );
            noteElems.setAttribute(
              "feedback",
              correctAnswers[ansSearch].feedback
            );

            // little bit of jank: for some reason this stuff gets run twice? with the second set of notes being the ones we actually want
            // so the if part adds the bad values to selNotes (which we may not need to do? who knows, it works for now)
            // and the else writes over the bad values with the good ones
            if (
              selNotes.findIndex((val) => val.startChar === note.startChar) ===
              -1
            )
              selNotes.push(note);
            else
              selNotes[
                selNotes.findIndex((val) => val.startChar === note.startChar)
              ] = note;

            for (let q = 0; q < noteElems.getAttribute("selectedTimes"); q++)
              highlight(note, undefined, false);
          }
        }
      }
      setLoaded(true);
    } else {
      console.log("abcString is undefined");
    }
  };

  //runs when reset answers button is pushed on mng view: essentially reloads score/resets answers
  const reload = function () {
    // see exReload for explanation of this jank
    for (let i = 0; i < selNotes.length; ) selNotes.pop();
    setSelNotes([]);
    // ditto
    for (let i = 0; i < correctAnswers.length; ) correctAnswers.pop();
    setCorrectAnswers([]);
    loadScore();
  };

  //same as above, but on exercises page
  const exReload = function () {
    // workaround because state is jank: empties selAnswers via popping before... setting it to an empty list (thanks react)
    for (let i = 0; i < selAnswers.length; ) selAnswers.pop();
    setSelAnswers([]);
    loadScore();
  };

  //runs when save button is pushed on mng view: overwrites exercise data at current index with updated choices
  const save = async function () {
    try {
      var data;
      if (correctAnswers.length > 0) {
        correctAnswers.sort((i1, i2) => {
          if ((i1.index as number) > (i2.index as number)) return 1;
          if ((i1.index as number) < (i2.index as number)) return -1;
          return 0;
        });
      }
      if (
        abcFile !== undefined &&
        abcFile !== "" &&
        mp3File.name !== "" &&
        correctAnswers.length > 0
      ) {
        data = new ExerciseData(
          abcFile,
          mp3File,
          correctAnswers,
          "",
          exInd,
          false,
          customTitle,
          diff,
          voices,
          tags,
          types,
          meter,
          transpos
        );

        //setExerciseData(data);

        // Get database reference
        const database = getDatabase();
        const storage = getStorage();

        // Save data to database
        const scoresRef = ref(database, "scores");
        const audioref = storageRef(storage, mp3File.name);

        await uploadBytes(audioref, mp3File);
        const dbDataRef = child(scoresRef, exInd.toString());

        // Check if the exercise already exists
        const snapshot = await get(dbDataRef);
        if (snapshot.exists()) {
          await set(dbDataRef, new DBData(data, mp3File.name));
          console.log("Exercise data was updated!");
          alert("exercise data was updated!");
        } else {
          console.log("Exercise with exIndex does not exist, adding it");
          await set(dbDataRef, new DBData(data, mp3File.name));
          console.log("New exercise added!");
          alert("new exercise added!");
        }

        if (fetch !== undefined) fetch(false);
      } else {
        console.log("Incomplete exercise - not saving to database");
        alert(
          "Something went wrong - make sure you: \n \
            -uploaded both a musicxml AND an mp3 file\n \
            -marked any applicable tags, voice #, and difficulty\n \
            -selected at least one correct answer"
        );
      }
    } catch (error) {
      console.error("Error", error);
      alert("error when saving the exercise.");
    }
  };

  //runs in clickListener on mng view: creates nested dictionaries with necessary selected answer info and sets correctAnswers to be pushed to database
  const multiAnswer = function () {
    const dict: { [label: string]: number }[] = [];
    for (let i = 0; i < selNotes.length; i++) {
      var noteElems = selNotes[i].abselem.elemset[0];
      const dict2: { [label: string]: number } = {
        index: noteElems.getAttribute("index"),
        staffPos: noteElems.getAttribute("staffPos"),
        measurePos: noteElems.getAttribute("measurePos"),
        selectedTimes: noteElems.getAttribute("selectedTimes"),
        feedback: noteElems.getAttribute("feedback"),
      };
      dict[i] = dict2;
    }

    setCorrectAnswers(dict);
  };

  //runs when check answers button is pushed on ex view: logs selected and correct answers for debug and toggles feedback to appear
  /* const log = function(){
        console.log(selAnswers);
        console.log(correctAnswers);
        setCustomFeedback([]);
        setChecking(true);
    } */

    //adding highlight measure function
    function highlightMeasure(selectedNotes: Element[], correctAnswers: any[]) {
    // Create a sets to store unique measure positions
    const measurePositionsSel = new Set<number>();
    const measurePositionsCorr = new Set<number>();
    
    // Iterate through selected notes to collect measure positions
    selectedNotes.forEach((noteElem) => {
      const measurePos = Number(noteElem.getAttribute("measurePos"));
      if (!isNaN(measurePos)) {
        measurePositionsSel.add(measurePos);
      }
    });


    //iterate through correct answers to collect measure positions
    correctAnswers.forEach((note) => {
        const corrPos = Number(note.measurePos);
        if (!isNaN(corrPos)){
            measurePositionsCorr.add(corrPos);
        }
    })

    //set of incorrect measures
    const errorMeasures = new Set<number>(Array.from(measurePositionsSel).filter((pos)=> !measurePositionsCorr.has(pos)));

    //console logs for debugging
    console.log("selected measures: ", measurePositionsSel);
    console.log("correct measures: ", measurePositionsCorr);
    console.log("wrong measures", errorMeasures);

    //check if there are any incorrect measures selected
    if (errorMeasures.size > 0){
        //create overlay(s) oon the measures that are incorrect and hint over correct
        console.log("there are incorrect measures selected, running through overlay functionality");
        measurePositionsCorr.forEach((corrPos) => {
            const existingOverlay = document.querySelector(`rect[data-measurePos='${corrPos}']`);
            if (existingOverlay){
                console.log("overlay exists, no need to add on top");
                return;
            } 
                const measure = document.querySelectorAll(`[measurePos='${corrPos}']`);
                
                // Calculate the bounding box for the entire measure
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
                measure.forEach((pos) => {
                    const bbox = (pos as SVGAElement).getBBox();
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                });
  
                // Set up overlay dimensions and positioning
                const overlay = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
                );
                overlay.setAttribute("x", minX.toString());
                overlay.setAttribute("y", minY.toString());
                overlay.setAttribute("width", (maxX - minX).toString());
                overlay.setAttribute("height", (maxY - minY).toString());
                overlay.setAttribute("fill", "rgba(61, 245, 39, 0.6)"); // semi-transparent red overlay for feedback
                overlay.setAttribute("class", "hint-highlight");
                overlay.setAttribute("data-measurePos", corrPos.toString());
  
                // Get the SVG element and append the overlay if it exists
                const svgElement = document.querySelector("svg");
                if (svgElement) {
                    svgElement.appendChild(overlay);
                } else {
                    console.error("SVG element not found!");
                }
        });

        //repeat above but for the incorrect measures (in red)
        measurePositionsSel.forEach((selPos) => {
            const existingOverlay = document.querySelector(`rect[data-measurePos='${selPos}']`);
            if (existingOverlay){
                console.log("overlay exists, no need to add on top");
                return;
            } 
                const measure = document.querySelectorAll(`[measurePos='${selPos}']`);
                
                // Calculate the bounding box for the entire measure
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
                measure.forEach((pos) => {
                    const bbox = (pos as SVGAElement).getBBox();
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                });
  
                // Set up overlay dimensions and positioning
                const overlay = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
                );
                overlay.setAttribute("x", minX.toString());
                overlay.setAttribute("y", minY.toString());
                overlay.setAttribute("width", (maxX - minX).toString());
                overlay.setAttribute("height", (maxY - minY).toString());
                overlay.setAttribute("fill", "rgba(255, 0, 0, 0.6)"); // semi-transparent red overlay for feedback
                overlay.setAttribute("class", "error-highlight");
                overlay.setAttribute("data-measurePos", selPos.toString());
  
                // Get the SVG element and append the overlay if it exists
                const svgElement = document.querySelector("svg");
                if (svgElement) {
                    svgElement.appendChild(overlay);
                } else {
                    console.error("SVG element not found!");
                }
        });
        //logic for when in the correct measure
     } else {
        console.log("in correct measure checking if correct note was selected, otherwise highlight correct note");
        // Additional logic for correct measure, wrong note
        correctAnswers.forEach((corrNote) =>{
            const existingOverlay = document.querySelector(`rect[data-index='${corrNote.index}']`);
            if (existingOverlay){
                console.log("overlay exists, no need to add on top");
                return;
            } 
                //create a bounding box for the overlat of the note
                const note = document.querySelectorAll(`[index='${corrNote.index}']`);
                
                // Calculate the bounding box for the note
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
                note.forEach((elem) => {
                    const bbox = (elem as SVGAElement).getBBox();
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                });
  
                // Set up overlay dimensions and positioning
                const overlay = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
                );
                overlay.setAttribute("x", minX.toString());
                overlay.setAttribute("y", minY.toString());
                overlay.setAttribute("width", (maxX - minX).toString());
                overlay.setAttribute("height", (maxY - minY).toString());
                overlay.setAttribute("fill", "rgba(61, 245, 39, 0.6)"); // semi-transparent red overlay for feedback
                overlay.setAttribute("class", "hint-highlight");
                overlay.setAttribute("data-index", corrNote.toString());
  
                // Get the SVG element and append the overlay if it exists
                const svgElement = document.querySelector("svg");
                if (svgElement) {
                    svgElement.appendChild(overlay);
                } else {
                }
        });
       
        }
    }

    //function run when check answers button pressed on ex view: checks selected vs correct answers and displays feedback accordingly
    const checkAnswers = function(){
        var tmpSelected = [...selAnswers];
        var tmpCorrect = [...correctAnswers];
        var feedback: string[] = [];

        // sorting copy of selAnswers for comparison against copy of correctAnswers
        tmpSelected.sort((i1, i2) => {
            if ((i1.abselem.elemset[0].getAttribute("index") as number) > (i2.abselem.elemset[0].getAttribute("index") as number)) return 1;
            if ((i1.abselem.elemset[0].getAttribute("index") as number) < (i2.abselem.elemset[0].getAttribute("index") as number)) return -1;
            return 0;
        })

        // holds indexes of answers that were the right note, but wrong error
        let closeList: Number[] = [];
        
        // holds incorrect answer info for feedback
        let wrongList = [];

        // loops through corr/sel copies in a unique way to compare answers
        for(var i=0,j=0;i<correctAnswers.length && j<selAnswers.length && tmpCorrect[i] !== undefined;){
            let noteElems = tmpSelected[j].abselem.elemset[0];
            // note index is right -- but is it the right error?
            if(noteElems.getAttribute("index") === tmpCorrect[i]["index"]){
                // answer is fully correct: removes note from correct array
                if((noteElems.getAttribute("selectedTimes")) === tmpCorrect[i]["selectedTimes"])
                    tmpCorrect = tmpCorrect.filter(function(ans){return ans["index"] !== tmpCorrect[i]["index"]});
                // wrong error type selected: note is added to closeList
                else closeList.push(Number(tmpCorrect[i]["index"]));

                // either way, if the index is correct, selected copy iterator moved forward
                j++;

            // note index is larger than the i'th element of correct array: correct iterator moved forward (preserves missed answers for feedback)
            } else if(noteElems.getAttribute("index") > tmpCorrect[i]["index"]) i++;

            // note index is smaller than the i'th element of correct array: selected iterator moved forward and value added to wrongList
            else if(noteElems.getAttribute("index") < tmpCorrect[i]["index"]){
                wrongList.push(noteElems);
                j++;
            } 
        }
    })


        // no missed answers in correct array and selected array is the same length as the original correct array: all good!
        if(tmpCorrect.length === 0 && tmpSelected.length === correctAnswers.length){
            feedback = ["Great job identifying the errors in this passage!"];

        // wrong amount of answers selected: shows general positions of corr answers and wrong answer positions
        } else if(tmpSelected.length !== correctAnswers.length){
            var plural = " are ";
            if (correctAnswers.length === 1) plural = " is ";
            feedback = (["You selected " + selAnswers.length + " answer(s). There" + plural + correctAnswers.length + " correct answer(s). Here are some specific places to look at and listen to more closely:"]);
            for(let i = 0;i < tmpCorrect.length;i++){
                // generic note position feedback
                feedback = ([...feedback, "Measure " + (Number(tmpCorrect[i]["measurePos"])+1) + ", Staff " + (Number(tmpCorrect[i]["staffPos"])+1)]);
                //call highlight measure function
                highlightMeasure(wrongList, tmpCorrect);
                
            }
            for(let i = 0;i < wrongList.length;i++){
                // position of any wrong answers selected
                feedback = ([...feedback,"Wrong answer selected at: " + "Measure " + (Number(wrongList[i].getAttribute("measurePos"))+1) + ", Staff " + (Number(wrongList[i].getAttribute("staffPos"))+1)])
                //console.log(wrongList[i]);
                //call highlight measure function
                highlightMeasure(wrongList, tmpCorrect);
                
            }


        // no correct answers selected
        } else if(tmpCorrect.length === correctAnswers.length){
            feedback = ["Keep trying; the more you practice the better you will get. Here are some specific places to look at and listen to more closely:"];
            // iterates through missed answers giving info/note specific feedback (if added on mng page)
            for(let i = 0;i < tmpCorrect.length;i++){
                // generic note position feedback
                feedback = ([...feedback, "Measure " + (Number(tmpCorrect[i]["measurePos"])+1) + ", Staff " + (Number(tmpCorrect[i]["staffPos"])+1)]);
                //call highlight meausre function
                highlightMeasure(wrongList, tmpCorrect);


    if (errorMeasures.size > 0){
        console.log("there are incorrect measures selected, running through overlay functionality");
        measurePositionsCorr.forEach((corrPos) => {
            const existingOverlay = document.querySelector(`rect[data-measurePos='${corrPos}']`);
            if (existingOverlay){
                console.log("overlay exists, no need to add on top");
                return;
            } 

                const measure = document.querySelectorAll(`[measurePos='${corrPos}']`);
                //logic for creating green overlay
                
                // adds any feedback to array for display later
                if(addtlFeedback !== ""){
                    let add = feedback.pop();
                    feedback = [...feedback, add + ". Additional feedback: " + addtlFeedback];
                    //call highlight measure function
                    highlightMeasure(wrongList, tmpCorrect);
                } 
            }
        
        // one or more correct answers selected 
        }else if(tmpCorrect.length < correctAnswers.length){
            feedback = ["Good work – you’ve found some of the errors, but here are some specific places to look at and listen to more closely:"];
            // same as above feedback loop
            for(let i = 0;i < tmpCorrect.length;i++){
                feedback = ([...feedback, "Measure " + (Number(tmpCorrect[i]["measurePos"])+1) + ", Staff " + (Number(tmpCorrect[i]["staffPos"])+1)]);
                //call highlight measure function
                highlightMeasure(wrongList, tmpCorrect);
                let addtlFeedback = tmpCorrect[i]["feedback"];
                if(closeList.includes(Number(tmpCorrect[i]["index"])) && !tmpCorrect[i]["feedback"].toString().startsWith("You’ve found where the error is (hurray!) but you’ve mis-identified the kind of error (try again!). "))
                        addtlFeedback = "You’ve found where the error is (hurray!) but you’ve mis-identified the kind of error (try again!). " + tmpCorrect[i]["feedback"];
                if(addtlFeedback !== ""){
                    let add = feedback.pop();
                    feedback = [...feedback, add + ". Additional feedback: " + addtlFeedback];
                    //call highlight measure function
                    highlightMeasure(wrongList, tmpCorrect);
                } 
            }
        }

        // sets customFeedback to copy of feedback array, to eventually be mapped into a list on the page
        setCustomFeedback([...feedback]);
    }

        measurePositionsSel.forEach((selPos) => {
            const existingOverlay = document.querySelector(`rect[data-measurePos='${selPos}']`);
            if (existingOverlay){
                console.log("overlay exists, no need to add on top");
                return;
            } 

                const measure = document.querySelectorAll(`[measurePos='${selPos}']`);
                //logic for creating green overlay
                
                // Calculate the bounding box for the entire measure
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
                measure.forEach((pos) => {
                    const bbox = (pos as SVGAElement).getBBox();
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                });
  
                // Set up overlay dimensions and positioning
                const overlay = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
                );
                overlay.setAttribute("x", minX.toString());
                overlay.setAttribute("y", minY.toString());
                overlay.setAttribute("width", (maxX - minX).toString());
                overlay.setAttribute("height", (maxY - minY).toString());
                overlay.setAttribute("fill", "rgba(255, 0, 0, 0.6)"); // semi-transparent red overlay for feedback
                overlay.setAttribute("class", "error-highlight");
                overlay.setAttribute("data-measurePos", selPos.toString());
  
                // Get the SVG element and append the overlay if it exists
                const svgElement = document.querySelector("svg");
                if (svgElement) {
                    svgElement.appendChild(overlay);
                } else {
                    console.error("SVG element not found!");
                }
        });
     } else {
        console.log("in correct measure checking if correct note was selected, otherwise highlight correct note");
        // Additional logic for correct measure, wrong note
        correctAnswers.forEach((corrNote) =>{
            const existingOverlay = document.querySelector(`rect[data-index='${corrNote.index}']`);
            if (existingOverlay){
                console.log("overlay exists, no need to add on top");
                return;
            } 

                const note = document.querySelectorAll(`[index='${corrNote.index}']`);
                //logic for creating green overlay
                
                // Calculate the bounding box for the entire measure
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
                note.forEach((elem) => {
                    const bbox = (elem as SVGAElement).getBBox();
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                });
  
                // Set up overlay dimensions and positioning
                const overlay = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
                );
                overlay.setAttribute("x", minX.toString());
                overlay.setAttribute("y", minY.toString());
                overlay.setAttribute("width", (maxX - minX).toString());
                overlay.setAttribute("height", (maxY - minY).toString());
                overlay.setAttribute("fill", "rgba(61, 245, 39, 0.6)"); // semi-transparent red overlay for feedback
                overlay.setAttribute("class", "hint-highlight");
                overlay.setAttribute("data-index", corrNote.toString());
  
                // Get the SVG element and append the overlay if it exists
                const svgElement = document.querySelector("svg");
                if (svgElement) {
                    svgElement.appendChild(overlay);
                } else {
                }
        });
       
        }
    }


  //function run when check answers button pressed on ex view: checks selected vs correct answers and displays feedback accordingly
  const checkAnswers = function () {
    var tmpSelected = [...selAnswers];
    var tmpCorrect = [...correctAnswers];
    var feedback: string[] = [];

    // sorting copy of selAnswers for comparison against copy of correctAnswers
    tmpSelected.sort((i1, i2) => {
      if (
        (i1.abselem.elemset[0].getAttribute("index") as number) >
        (i2.abselem.elemset[0].getAttribute("index") as number)
      )
        return 1;
      if (
        (i1.abselem.elemset[0].getAttribute("index") as number) <
        (i2.abselem.elemset[0].getAttribute("index") as number)
      )
        return -1;
      return 0;
    });

    // holds indexes of answers that were the right note, but wrong error
    let closeList: Number[] = [];

    // holds incorrect answer info for feedback
    let wrongList = [];

    // loops through corr/sel copies in a unique way to compare answers
    for (
      var i = 0, j = 0;
      i < correctAnswers.length &&
      j < selAnswers.length &&
      tmpCorrect[i] !== undefined;

    ) {
      let noteElems = tmpSelected[j].abselem.elemset[0];
      // note index is right -- but is it the right error?
      if (noteElems.getAttribute("index") === tmpCorrect[i]["index"]) {
        // answer is fully correct: removes note from correct array
        if (
          noteElems.getAttribute("selectedTimes") ===
          tmpCorrect[i]["selectedTimes"]
        )
          tmpCorrect = tmpCorrect.filter(function (ans) {
            return ans["index"] !== tmpCorrect[i]["index"];
          });
        // wrong error type selected: note is added to closeList
        else closeList.push(Number(tmpCorrect[i]["index"]));

        // either way, if the index is correct, selected copy iterator moved forward
        j++;

        // note index is larger than the i'th element of correct array: correct iterator moved forward (preserves missed answers for feedback)
      } else if (noteElems.getAttribute("index") > tmpCorrect[i]["index"]) i++;
      // note index is smaller than the i'th element of correct array: selected iterator moved forward and value added to wrongList
      else if (noteElems.getAttribute("index") < tmpCorrect[i]["index"]) {
        wrongList.push(noteElems);
        j++;
      }
    }

    // no missed answers in correct array and selected array is the same length as the original correct array: all good!
    if (
      tmpCorrect.length === 0 &&
      tmpSelected.length === correctAnswers.length
    ) {
      feedback = ["Great job identifying the errors in this passage!"];

      // wrong amount of answers selected: shows general positions of corr answers and wrong answer positions
    } else if (tmpSelected.length !== correctAnswers.length) {
      var plural = " are ";
      if (correctAnswers.length === 1) plural = " is ";
      feedback = [
        "You selected " +
          selAnswers.length +
          " answer(s). There" +
          plural +
          correctAnswers.length +
          " correct answer(s). Here are some specific places to look at and listen to more closely:",
      ];
      for (let i = 0; i < tmpCorrect.length; i++) {
        // generic note position feedback
        feedback = [
          ...feedback,
          "Measure " +
            (Number(tmpCorrect[i]["measurePos"]) + 1) +
            ", Staff " +
            (Number(tmpCorrect[i]["staffPos"]) + 1),
        ];
        highlightMeasure(wrongList, tmpCorrect);
      }
      for (let i = 0; i < wrongList.length; i++) {
        // position of any wrong answers selected
        feedback = [
          ...feedback,
          "Wrong answer selected at:  Measure " +
            (Number(wrongList[i].getAttribute("measurePos")) + 1) +
            ", Staff " +
            (Number(wrongList[i].getAttribute("staffPos")) + 1),
        ];
        //console.log(wrongList[i]);
        highlightMeasure(wrongList, tmpCorrect);
      }

      // no correct answers selected
    } else if (tmpCorrect.length === correctAnswers.length) {
      feedback = [
        "Keep trying; the more you practice the better you will get. Here are some specific places to look at and listen to more closely:",
      ];
      // iterates through missed answers giving info/note specific feedback (if added on mng page)
      for (let i = 0; i < tmpCorrect.length; i++) {
        // generic note position feedback
        feedback = [
          ...feedback,
          "Measure " +
            (Number(tmpCorrect[i]["measurePos"]) + 1) +
            ", Staff " +
            (Number(tmpCorrect[i]["staffPos"]) + 1),
        ];
        highlightMeasure(wrongList, tmpCorrect);
        // specific note feedback added on mng page
        let addtlFeedback = tmpCorrect[i]["feedback"];

        // additional msg for if wrong error is selected
        if (
          closeList.includes(Number(tmpCorrect[i]["index"])) &&
          !tmpCorrect[i]["feedback"]
            .toString()
            .startsWith(
              "You’ve found where the error is (hurray!) but you’ve mis-identified the kind of error (try again!). "
            )
        )
          addtlFeedback =
            "You’ve found where the error is (hurray!) but you’ve mis-identified the kind of error (try again!). " +
            tmpCorrect[i]["feedback"];

        // adds any feedback to array for display later
        if (addtlFeedback !== "") {
          let add = feedback.pop();
          feedback = [
            ...feedback,
            add + ". Additional feedback: " + addtlFeedback,
          ];
          highlightMeasure(wrongList, tmpCorrect);
        }
      }

      // one or more correct answers selected
    } else if (tmpCorrect.length < correctAnswers.length) {
      feedback = [
        "Good work – you’ve found some of the errors, but here are some specific places to look at and listen to more closely:",
      ];
      // same as above feedback loop
      for (let i = 0; i < tmpCorrect.length; i++) {
        feedback = [
          ...feedback,
          "Measure " +
            (Number(tmpCorrect[i]["measurePos"]) + 1) +
            ", Staff " +
            (Number(tmpCorrect[i]["staffPos"]) + 1),
        ];
        highlightMeasure(wrongList, tmpCorrect);
        let addtlFeedback = tmpCorrect[i]["feedback"];
        if (
          closeList.includes(Number(tmpCorrect[i]["index"])) &&
          !tmpCorrect[i]["feedback"]
            .toString()
            .startsWith(
              "You’ve found where the error is (hurray!) but you’ve mis-identified the kind of error (try again!). "
            )
        )
          addtlFeedback =
            "You’ve found where the error is (hurray!) but you’ve mis-identified the kind of error (try again!). " +
            tmpCorrect[i]["feedback"];
        if (addtlFeedback !== "") {
          let add = feedback.pop();
          feedback = [
            ...feedback,
            add + ". Additional feedback: " + addtlFeedback,
          ];
          highlightMeasure(wrongList, tmpCorrect);
        }
      }
    }

    // sets customFeedback to copy of feedback array, to eventually be mapped into a list on the page
    setCustomFeedback([...feedback]);
  };

  //runs when save note feedback button is pushed on mng view: saves individual note feedback into the selected note
  const saveFeedback = function (e: React.ChangeEvent<HTMLTextAreaElement>) {
    var feedBox = document.getElementById("note-feedback-" + exIndex);
    if (feedBox !== null && "value" in feedBox) {
      var str = feedBox.value as string;
      if (lastClicked !== undefined) {
        lastClicked.abselem.elemset[0].setAttribute("feedback", str);
        multiAnswer();
      }
    }
  };

  //saveFeedback, but with the exercise title
  const saveTitle = function () {
    var titleBox = document.getElementById("title");
    if (titleBox !== null && "value" in titleBox) {
      var str = titleBox.value as string;
      setCustomTitle(str);
      setEditingTitle(!editingTitle);
    }
  };

  //helper run in fieldChange functions to set the custom exercise title based on all the fields
  const customTitleChange = function (
    tags: string[],
    diff: number,
    voices: number,
    types: string,
    meter: string,
    transpos: boolean
  ) {
    let exNum = findNum(tags, diff, voices, types, meter, transpos);
    // lots of special cases for meter/types being certain things, title adjusted accordingly
    if (meter === "Anything") {
      if (types === "None") {
        setCustomTitle(
          tags.sort().join(" & ") + ": Level " + diff + ", Exercise: " + exNum
        );
        if (transpos)
          setCustomTitle(
            tags.sort().join(" & ") +
              ": Transpose Insts - Level " +
              diff +
              ", Exercise: " +
              exNum
          );
      } else if (types === "Both") {
        setCustomTitle(
          tags.sort().join(" & ") +
            ": Drone/Ens Parts  - Level " +
            diff +
            ", Exercise: " +
            exNum
        );
        if (transpos)
          setCustomTitle(
            tags.sort().join(" & ") +
              ": Drone/Ens Parts w/ Transpose Insts - Level " +
              diff +
              ", Exercise: " +
              exNum
          );
      } else {
        setCustomTitle(
          tags.sort().join(" & ") +
            ": " +
            types +
            " - Level " +
            diff +
            ", Exercise: " +
            exNum
        );
        if (transpos)
          setCustomTitle(
            tags.sort().join(" & ") +
              ": " +
              types +
              " w/ Transpose Insts - Level " +
              diff +
              ", Exercise: " +
              exNum
          );
      }
    } else {
      if (types === "None") {
        setCustomTitle(
          tags.sort().join(" & ") +
            ": " +
            meter +
            " - Level " +
            diff +
            ", Exercise: " +
            exNum
        );
        if (transpos)
          setCustomTitle(
            tags.sort().join(" & ") +
              ": " +
              meter +
              "  w/ Transpose Insts - Level " +
              diff +
              ", Exercise: " +
              exNum
          );
      } else if (types === "Both") {
        setCustomTitle(
          tags.sort().join(" & ") +
            ": Drone/Ens Parts: " +
            meter +
            " - Level " +
            diff +
            ", Exercise: " +
            exNum
        );
        if (transpos)
          setCustomTitle(
            tags.sort().join(" & ") +
              ": Drone/Ens Parts: " +
              meter +
              " w/ Transpose Insts - Level " +
              diff +
              ", Exercise: " +
              exNum
          );
      } else {
        setCustomTitle(
          tags.sort().join(" & ") +
            ": " +
            types +
            ": " +
            meter +
            " - Level " +
            diff +
            ", Exercise: " +
            exNum
        );
        if (transpos)
          setCustomTitle(
            tags.sort().join(" & ") +
              ": " +
              types +
              ": " +
              meter +
              " w/ Transpose Insts - Level " +
              diff +
              ", Exercise: " +
              exNum
          );
      }
    }
  };

  //onClick function for whenever difficulty is changed
  const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setDiff(Number(e.target.value));
    customTitleChange(
      tags,
      Number(e.target.value),
      voices,
      types,
      meter,
      transpos
    );
  };

  //onClick function for whenever tags are changed
  const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    // case where the tag is already checked and needs to be removed
    if (tags.includes(val)) {
      tags.splice(tags.indexOf(val), 1);
      setTags([...tags]);
      customTitleChange([...tags], diff, voices, types, meter, transpos);
      // tag is newly checked, needs to be added
    } else {
      setTags([...tags, val]);
      customTitleChange([...tags, val], diff, voices, types, meter, transpos);
    }
  };

  //onClick function for whenever voices are changed - don't need to change ex title for voices
  const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setVoices(Number(e.target.value));
  };

  //onClick function for whenever types are changed
  const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setTypes(e.target.value);
    customTitleChange(tags, diff, voices, e.target.value, meter, transpos);
  };

  //onClick function for when meter is changed
  const meterChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setMeter(e.target.value);
    customTitleChange(tags, diff, voices, types, e.target.value, transpos);
  };

  //onClick function for when transposition is changed
  const transposChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    //let val = e.target.value;
    setTranspos(!transpos);
    customTitleChange(tags, diff, voices, types, meter, !transpos);
  };

  //function used in customTitleChange to find the number of exercises with certain fields for unique exercise naming
  const findNum = function (
    tags: string[],
    difficulty: number,
    voices: number,
    types: string,
    meter: string,
    transpos: boolean
  ): number {
    const count = allExData.filter((exData: ExerciseData | undefined) => {
      if (
        exData !== undefined &&
        exData.tags !== undefined &&
        exData.difficulty !== undefined
      ) {
        return (
          exData.tags.sort().toString() === tags.sort().toString() &&
          exData.difficulty === difficulty &&
          //exData.voices === voices &&
          exData.types === types &&
          exData.meter === meter &&
          exData.transpos === transpos
        );
      } else {
        return false;
      }
    });
    return count.length + 1;
  };

  //function used with bebug bubbon for testing
  /* const debug = function() {
        console.log(selNotes);
    } */

  //deleting the exercise from database and website
  const handleExerciseDelete = async (exIndex: number) => {
    try {
      //get database reference
      const database = getDatabase();

      //find the exercise based on matching exIndex
      const exerciseRef = ref(database, `scores/${exIndex}`);
      const snapshot = await get(exerciseRef);
      if (snapshot.exists()) {
        var exTitle = title;
        await remove(exerciseRef);
        console.log("exercise deleted from the database!");

        //removing exercise from the page, need to reload page to see changes on website
        const updatedExercises = allExData.filter((exercise) => {
          return exercise && exercise.exIndex !== exIndex;
        });
        setAllExData(updatedExercises);
        alert("exercise " + exTitle + " deleted!");

        // reload the page without changing the url
        window.location.reload();
      } else {
        //if no matching exercise is found
        console.log("exercise with" + exIndex + " not found!");
        alert("exercise not found.");
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("error deleting exercise.");
    }
  };

  return (
    // big yellow exercise box
    <div
      style={{
        margin: "10px",
        padding: "10px",
        backgroundColor: "#fcfcd2",
        borderRadius: "10px",
        marginLeft: "100px",
        marginTop: "20px",
      }}
    >
      {/* custom exercise title box */}
      {editingTitle && teacherMode ? (
        <span>
          <textarea id="title">{customTitle}</textarea>
          <button onClick={saveTitle}>Save Title</button>
        </span>
      ) : (
        <h3 onClick={() => setEditingTitle(!editingTitle)}>{customTitle}</h3>
      )}

      {/* <h4>Global Index: {exIndex}</h4> <- use for debugging in case something goes wrong w indexing*/}
      {teacherMode ? (
        <span>
          {/* all the fields you can apply to an exercise: tags, voices, etc, you can read */}
          <div id="forms" style={{ display: "inline-flex", padding: "4px" }}>
            <form id="tags">
              Tags:
              <br></br>
              {/* <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange}/>Rhythm */}
              <input
                type="checkbox"
                name="tags"
                value="Pitch"
                checked={tags.includes("Pitch")}
                onChange={tagsChange}
                style={{ margin: "4px" }}
              />
              Pitch
              <input
                type="checkbox"
                name="tags"
                value="Intonation"
                checked={tags.includes("Intonation")}
                onChange={tagsChange}
                style={{ marginLeft: "12px" }}
              />{" "}
              Intonation
              <label>
                <input
                  type="checkbox"
                  name="tags"
                  value="Rhythm"
                  checked={tags.includes("Rhythm")}
                  onChange={tagsChange}
                />
                Rhythm
              </label>
            </form>
            <form id="voiceCt">
              Voices:
              <br></br>
              <select
                name="voices"
                defaultValue={voices}
                onChange={voiceChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </form>
            <form id="difficulty">
              Difficulty:
              <br></br>
              <select
                name="difficulty"
                defaultValue={diff}
                onChange={diffChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </form>
            <form id="meter">
              Meter:
              <br></br>
              <select name="meter" defaultValue={types} onChange={meterChange}>
                <option value="Anything">Anything</option>
                <option value="Simple">Simple</option>
                <option value="Compound">Compound</option>
              </select>
            </form>
            <form id="types">
              Textural Factors:
              <br></br>
              <select name="types" defaultValue={types} onChange={typesChange}>
                <option value="None">None</option>
                <option value="Drone">Drone</option>
                <option value="Ensemble Parts">Ensemble Parts</option>
                <option value="Both">Drone & Ensemble Parts</option>
              </select>
            </form>
            <form id="transpos">
              Transposing Instruments:
              <br></br>
              <input
                type="checkbox"
                name="transpos"
                value="true"
                checked={transpos}
                onChange={transposChange}
                style={{ marginLeft: "5.3vw" }}
              />
            </form>
          </div>
          <div />

          {/* file uploads */}
          <div id="xmlUpload" style={{ display: "inline-flex" }}>
            XML Upload:{" "}
            <FileUpload
              setFile={setXmlFile}
              file={xmlFile}
              setAbcFile={setAbcFile}
              type="xml"
              setLoaded={setLoaded}
            ></FileUpload>
          </div>
          <div id="mp3Upload" style={{ display: "inline-flex" }}>
            MP3 Upload:{" "}
            <FileUpload
              setFile={setMp3File}
              file={mp3File}
              setAbcFile={setAbcFile}
              type="mp3"
              setLoaded={setLoaded}
            ></FileUpload>
          </div>

          {mp3File.name === "" ? <br></br> : <></>}

          {/* this button shouldn't actually be able to appear, but is a backup in case useEffect doesn't load the score */}
          {(exerciseData !== undefined && !exerciseData.empty && !loaded) ||
          (abcFile !== undefined && abcFile !== "" && !loaded) ? (
            <button onClick={loadScore}>Load Score</button>
          ) : (
            <></>
          )}

          {/* div that actually contains the score */}
          <div style={{ display: "inline-block", width: "75%" }}>
            <div id={"target" + exIndex} style={score}></div>
          </div>

          <img
            alt="note-color-key"
            src={noteKey}
            width="14%"
            height="7%"
            style={{ display: "inline", marginLeft: "1vw" }}
          />

          {/* stuff that only shows once an xml has been passed in: individual note feedback, reset answers button */}
          {(abcFile !== undefined && abcFile !== "" && loaded) ||
          (exerciseData !== undefined && !exerciseData.empty) ? (
            <div
              style={{
                display: "inline-block",
                marginLeft: "1vw",
                marginTop: "1vh",
              }}
            >
              <textarea
                id={"note-feedback-" + exIndex}
                placeholder={"Note feedback..."}
                onChange={saveFeedback}
              ></textarea>
              <Button
                variant="danger"
                onClick={reload}
                style={{ marginLeft: "1vw", float: "right" }}
              >
                Reset Answers
              </Button>
            </div>
          ) : (
            <></>
          )}

          {/* note info blurb in case teachers want to see which staff/measure the note is on (and can't/don't want to count i guess) */}
          {lastClicked !== undefined &&
          Number(lastClicked.abselem.elemset[0].getAttribute("selectedTimes")) %
            4 !==
            0 ? (
            <div style={{ marginLeft: "1vw" }}>Note Info: {ana}</div>
          ) : (
            <div />
          )}
          <br />
          <Button variant="success" onClick={save}>
            Save Exercise
          </Button>
          <Button
            onClick={() => handleExerciseDelete(exIndex)}
            style={{ marginLeft: "10px", marginTop: "10px" }}
            variant="danger"
          >
            Delete Exercise
          </Button>
        </span>
      ) : (
        /* student view */
        <span>
          {/* score div */}
          <div style={{ width: "100%", display: "inline-flex" }}>
            <div id={"target" + exIndex} style={score}></div>
          </div>
          <br />
          <img
            alt="note-color-key"
            src={noteKey}
            width="14%"
            height="7%"
            style={{
              display: "inline-flex",
              marginRight: "1vw",
              marginTop: "-2.5vh",
              borderRadius: "1px",
            }}
          />

          {/* container for the audio player and reset button */}
          <div style={{ display: "inline-flex", marginTop: "-2vh" }}>
            {mp3 !== undefined ? (
              <div style={{ marginTop: "2vh" }}>
                <AudioHandler file={mp3}></AudioHandler>
              </div>
            ) : (
              <></>
            )}
            <Button
              variant="danger"
              onClick={exReload}
              style={{
                position: "relative",
                marginLeft: "1vw",
                marginBottom: "2vh",
              }}
            >
              Reset Answers
            </Button>
          </div>

          {/* check button/feedback loaded only when score is present: should always happen based on mng upload parameters but here as a failsafe */}
          {abcFile !== undefined && abcFile !== "" && loaded ? (
            <div>
              <button className="btnback" onClick={checkAnswers}>
                Check Answer
              </button>
              <div>
                Next step(s):
                {customFeedback.map(function (feedback) {
                  // this key generation is COOKED but we don't need to access it and they all gotta be different sooooooo
                  return (
                    <li
                      style={{
                        display: "flex",
                        margin: "auto",
                        justifyContent: "center",
                      }}
                      key={Math.random()}
                    >
                      {feedback}
                    </li>
                  );
                })}
              </div>
            </div>
          ) : (
            <div />
          )}
        </span>
      )}

      {/* multi-exercise deletion box, only loads on teacher view because of how handle is defined (or "un"defined HAHAHA) */}
      {handleSelectExercise !== undefined ? (
        <div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectExercise(exIndex)}
          />
          Select to Delete (Multiple Deletion)
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
