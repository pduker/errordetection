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
  // for score styling
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

  // state initialization
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

  // try to load score when there's either exerciseData or an abc file to pull from
  useEffect(() => {
    if (
      (exerciseData !== undefined && !exerciseData.empty && !loaded) ||
      (abcFile !== undefined && abcFile !== "" && !loaded)
    )
      loadScore();
  });

  // helper function from abcjs for highlighting
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

  // highlighting function with guard added to avoid accessing undefined properties
  const highlight = function (note: any, klass: any, clicked: boolean): number {
    if (!note || !note.abselem || !note.abselem.elemset || note.abselem.elemset.length === 0) {
      return 0;
    }
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
      color = "#ff6100"; // orange
    }
    if (selTim === 2) {
      color = "#648fff"; // blue
    }
    if (clicked)
      note.abselem.elemset[0].setAttribute("selectedTimes", selTim);
    setClass(note.abselem.elemset, klass, "", color);
    return retval;
  };

  // click listener for notes with a guard to ensure note.abselem exists
  const clickListener = function (
    abcelem: any,
    tuneNumber: number,
    classes: string,
    analysis: abcjs.ClickListenerAnalysis,
    drag: abcjs.ClickListenerDrag
  ) {
    var note = abcelem;
    if (!note || !note.abselem || !note.abselem.elemset || note.abselem.elemset.length === 0) {
      return;
    }
    var noteElems = note.abselem.elemset[0];

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
      if (teacherMode) multiAnswer();
    } else {
      if (!selAnswers.includes(note)) {
        selAnswers.push(note);
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

    var staffCt = Number(noteElems.getAttribute("staffPos")) + 1,
      measureCt = Number(noteElems.getAttribute("measurePos")) + 1;
    setAna("Staff " + staffCt + ", measure " + measureCt);

    setLastClicked(note);
    var txt = document.getElementById("note-feedback-" + exIndex);
    if (txt !== null && "value" in txt)
      txt.value = noteElems.getAttribute("feedback");
  };

  // loadScore: renders the abc and overlays blue beat selectors for rhythm exercises
  const loadScore = function () {
    var abcString = abcFile;
    abcString = abcString.replace("Z:Copyright ©\n", "");
    abcString = abcString.replace("T:Title\n", "");
    var el = document.getElementById("target" + exIndex);
    if (el !== null && abcString !== undefined) {
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
      // Initialize beat counter for rhythm exercises
      let currentBeatIndex = 1;

      const svgElement = document.querySelector("svg");
      const boundingBox: DOMRect | undefined =
        svgElement?.getBoundingClientRect();

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
          // Reset beat index at new measure in Rhythm exercises
          if (tags.includes("Rhythm")) {
            currentBeatIndex = 1;
          }
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

        if (tags.includes("Rhythm")) {
          if (!boundingBox) {
            return;
          }

          if (beatSum === 0) {
            barStartX = noteElems.getBoundingClientRect().left;
          }

          if (typeof note.duration === "number" && !isNaN(note.duration)) {
            beatSum += note.duration;
            noteCount++;
          }

          const topLines = svgElement?.querySelectorAll(".abcjs-top-line");
          let totalSum: number = 0;

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
                // bar.style.top = topBox.top - noteElems.getBoundingClientRect().top - 10 + "px";
                bar.style.top =
                  noteElems.getBoundingClientRect().top - boundingBox.top - 15 <
                  topBox.top - boundingBox.top - 15
                    ? noteElems.getBoundingClientRect().top -
                      boundingBox.top -
                      15 + "px"
                    : topBox.top -
                      boundingBox.top -
                      15 +
                      "px";

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

            // Assign beat index for this overlay
            const beatIndexForOverlay = currentBeatIndex;
            bar.setAttribute("data-beatIndex", beatIndexForOverlay.toString());

            bar.addEventListener("click", () => {
              if (bar.getAttribute("data-selected") === "true") {
                bar.setAttribute("data-selected", "false");
                bar.style.opacity = "0.2";
                coverBox.style.opacity = "0";
                const index = selAnswers.findIndex(
                  (item) =>
                    item.type === "beat" &&
                    item.measurePos == measure &&
                    item.staffPos == staff &&
                    item.beatIndex == beatIndexForOverlay
                );
                if (index !== -1) {
                  selAnswers.splice(index, 1);
                }
              } else {
                bar.setAttribute("data-selected", "true");
                bar.style.opacity = "1";
                coverBox.style.opacity = "0.5";
                const beatObj = {
                  measurePos: measure,
                  staffPos: staff,
                  beatIndex: beatIndexForOverlay,
                  type: "beat",
                };
                selAnswers.push(beatObj);
              }
              if (teacherMode) multiAnswer();
            });

            const parentElement = document.getElementById("target" + exIndex);
            if (parentElement) {
              parentElement.style.position = "relative";
              parentElement.appendChild(bar);
              parentElement.appendChild(coverBox);
            }

            totalSum = beatSum;
            beatSum -= visualObjs[0].getBeatLength();
            noteCount = 0;
            created = true;

            // Increment beat index for next beat in same measure
            currentBeatIndex++;
          }

          if (beatSum === visualObjs[0].getBeatLength()) {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.position = "absolute";

            const coverBox = document.createElement("div");
            coverBox.classList.add("cover-box");
            coverBox.style.position = "absolute";

            if (topLines) {
              if (topLines[staff]) {
                const topBox = topLines[staff].getBoundingClientRect();
                // bar.style.top = topBox.top - boundingBox.top - 10 + "px";
                bar.style.top =
                  noteElems.getBoundingClientRect().top - boundingBox.top - 15 <
                  topBox.top - boundingBox.top - 15
                    ? noteElems.getBoundingClientRect().top -
                      boundingBox.top -
                      15 + "px"
                    : topBox.top -
                      boundingBox.top -
                      15 +
                      "px";
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
                  (noteElems.nextSibling.getBoundingClientRect().left - barStartX) /
                    (totalSum / visualObjs[0].getBeatLength()) +
                  "px";
              }
              bar.style.backgroundColor = "blue";
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
            bar.style.opacity = "0.2";

            coverBox.style.top = bar.style.top;
            coverBox.style.left = bar.style.left;
            coverBox.style.width = bar.style.width;
            coverBox.style.height =
              boundingBox.height / 2 / staffArray.length + "px";
            coverBox.style.backgroundColor = "blue";
            coverBox.style.opacity = "0";
            coverBox.style.pointerEvents = "none";

            // Assign beat index for this overlay
            const beatIndexForOverlay = currentBeatIndex;
            bar.setAttribute("data-beatIndex", beatIndexForOverlay.toString());

            bar.addEventListener("click", () => {
              if (bar.getAttribute("data-selected") === "true") {
                bar.setAttribute("data-selected", "false");
                bar.style.opacity = "0.2";
                coverBox.style.opacity = "0";
                const index = selAnswers.findIndex(
                  (item) =>
                    item.type === "beat" &&
                    item.measurePos == measure &&
                    item.staffPos == staff &&
                    item.beatIndex == beatIndexForOverlay
                );
                if (index !== -1) {
                  selAnswers.splice(index, 1);
                }
              } else {
                bar.setAttribute("data-selected", "true");
                bar.style.opacity = "1";
                coverBox.style.opacity = "0.5";
                const beatObj = {
                  measurePos: measure,
                  staffPos: staff,
                  beatIndex: beatIndexForOverlay,
                  type: "beat",
                };
                selAnswers.push(beatObj);
              }
              if (teacherMode) multiAnswer();
            });

            const parentElement = document.getElementById("target" + exIndex);
            if (parentElement) {
              parentElement.style.position = "relative";
              parentElement.appendChild(bar);
              parentElement.appendChild(coverBox);
            }
            beatSum = 0;
            noteCount = 0;
            // Increment beat index after a beat is completed
            currentBeatIndex++;
          }
        }

        if (teacherMode) {
          var ansSearch = correctAnswers.findIndex(
            (answer: { [label: string]: string | number }) =>
              answer.index === noteElems.getAttribute("index") &&
              note.el_type !== "bar"
          );
          if (ansSearch !== -1) {
            noteElems.setAttribute(
              "selectedTimes",
              correctAnswers[ansSearch].selectedTimes
            );
            noteElems.setAttribute(
              "feedback",
              correctAnswers[ansSearch].feedback
            );

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

  const reload = function () {
    for (let i = 0; i < selNotes.length; ) selNotes.pop();
    setSelNotes([]);
    for (let i = 0; i < correctAnswers.length; ) correctAnswers.pop();
    setCorrectAnswers([]);
    loadScore();
  };

  const exReload = function () {
    for (let i = 0; i < selAnswers.length; ) selAnswers.pop();
    setSelAnswers([]);
    loadScore();
  };

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

        const database = getDatabase();
        const storage = getStorage();

        const scoresRef = ref(database, "scores");
        const audioref = storageRef(storage, mp3File.name);

        await uploadBytes(audioref, mp3File);
        const dbDataRef = child(scoresRef, exInd.toString());

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

  // Updated multiAnswer: for Rhythm exercises, only use beat selections.
  const multiAnswer = function () {
    if (tags.includes("Rhythm")) {
      setCorrectAnswers([...selAnswers]);
      return;
    }
    const dict: { [label: string]: number | string }[] = [];
    for (let i = 0; i < selNotes.length; i++) {
      var noteElems = selNotes[i].abselem.elemset[0];
      const dict2: { [label: string]: number | string } = {
        index: noteElems.getAttribute("index"),
        staffPos: noteElems.getAttribute("staffPos"),
        measurePos: noteElems.getAttribute("measurePos"),
        selectedTimes: noteElems.getAttribute("selectedTimes"),
        feedback: noteElems.getAttribute("feedback"),
        type: "note",
      };
      dict.push(dict2);
    }

    if (tags.includes("Rhythm")) {
      selAnswers.forEach((ans) => {
        if (
          ans.type === "beat" &&
          !dict.find(
            (d) =>
              d.measurePos == ans.measurePos && d.beatIndex == ans.beatIndex
          )
        )
          dict.push(ans);
      });
    }
    setCorrectAnswers(dict);
  };

  // Added highlightMeasure function to resolve missing name error.
  // This function creates SVG overlays to highlight measures for non-rhythm exercises.
  const highlightMeasure = function (
    selectedNotes: Element[],
    correctAnswers: any[]
  ) {
    const measurePositionsSel = new Set<number>();
    const measurePositionsCorr = new Set<number>();

    selectedNotes.forEach((noteElem) => {
      const measurePos = Number(noteElem.getAttribute("measurePos"));
      if (!isNaN(measurePos)) {
        measurePositionsSel.add(measurePos);
      }
    });

    correctAnswers.forEach((note) => {
      const corrPos = Number(note.measurePos);
      if (!isNaN(corrPos)) {
        measurePositionsCorr.add(corrPos);
      }
    });

    const errorMeasures = new Set<number>(
      Array.from(measurePositionsSel).filter(
        (pos) => !measurePositionsCorr.has(pos)
      )
    );

    console.log("selected measures: ", measurePositionsSel);
    console.log("correct measures: ", measurePositionsCorr);
    console.log("wrong measures", errorMeasures);

    if (errorMeasures.size > 0) {
      console.log(
        "there are incorrect measures selected, running through overlay functionality"
      );
      measurePositionsCorr.forEach((corrPos) => {
        const existingOverlay = document.querySelector(
          `rect[data-measurePos='${corrPos}']`
        );
        if (existingOverlay) {
          console.log("overlay exists, no need to add on top");
          return;
        }
        const measure = document.querySelectorAll(`[measurePos='${corrPos}']`);
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        measure.forEach((pos) => {
          const bbox = (pos as SVGAElement).getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        });
        const overlay = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        overlay.setAttribute("x", minX.toString());
        overlay.setAttribute("y", minY.toString());
        overlay.setAttribute("width", (maxX - minX).toString());
        overlay.setAttribute("height", (maxY - minY).toString());
        overlay.setAttribute("fill", "rgba(61, 245, 39, 0.6)");
        overlay.setAttribute("class", "hint-highlight");
        overlay.setAttribute("data-measurePos", corrPos.toString());
        const svgElement = document.querySelector("svg");
        if (svgElement) {
          svgElement.appendChild(overlay);
        } else {
          console.error("SVG element not found!");
        }
      });

      measurePositionsSel.forEach((selPos) => {
        const existingOverlay = document.querySelector(
          `rect[data-measurePos='${selPos}']`
        );
        if (existingOverlay) {
          console.log("overlay exists, no need to add on top");
          return;
        }
        const measure = document.querySelectorAll(`[measurePos='${selPos}']`);
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        measure.forEach((pos) => {
          const bbox = (pos as SVGAElement).getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        });
        const overlay = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        overlay.setAttribute("x", minX.toString());
        overlay.setAttribute("y", minY.toString());
        overlay.setAttribute("width", (maxX - minX).toString());
        overlay.setAttribute("height", (maxY - minY).toString());
        overlay.setAttribute("fill", "rgba(255, 0, 0, 0.6)");
        overlay.setAttribute("class", "error-highlight");
        overlay.setAttribute("data-measurePos", selPos.toString());
        const svgElement = document.querySelector("svg");
        if (svgElement) {
          svgElement.appendChild(overlay);
        } else {
          console.error("SVG element not found!");
        }
      });
    } else {
      console.log(
        "in correct measure checking if correct note was selected, otherwise highlight correct measure"
      );
      correctAnswers.forEach((corrNote) => {
        const existingOverlay = document.querySelector(
          `rect[data-measurePos='${corrNote.measurePos}']`
        );
        if (existingOverlay) {
          console.log("overlay exists, no need to add on top");
          return;
        }
        const measure = document.querySelectorAll(
          `[measurePos='${corrNote.measurePos}']`
        );
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        measure.forEach((elem) => {
          const bbox = (elem as SVGAElement).getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        });
        const overlay = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        overlay.setAttribute("x", minX.toString());
        overlay.setAttribute("y", minY.toString());
        overlay.setAttribute("width", (maxX - minX).toString());
        overlay.setAttribute("height", (maxY - minY).toString());
        overlay.setAttribute("fill", "rgba(61, 245, 39, 0.6)");
        overlay.setAttribute("class", "hint-highlight");
        overlay.setAttribute("data-measurePos", corrNote.measurePos.toString());
        const svgElement = document.querySelector("svg");
        if (svgElement) {
          svgElement.appendChild(overlay);
        }
      });
    }
  };

   // function to get instrument list from abc score
   function getInstrumentList(abcScore: string): string[] {
    const instrumentNames: string[] = [];
    const regex = /V:\d+.*?nm="(.*?)"/g;
    let match;
  
    while ((match = regex.exec(abcScore)) !== null) {
      instrumentNames.push(match[1]);
    }
  
    return instrumentNames;
  }

  // Updated checkAnswers: branch for rhythm exercises
  const checkAnswers = function () {
    const instruments = getInstrumentList(exerciseData.score);

    if (tags.includes("Rhythm")) {
      var feedback: string[] = [];
      var plural = " are ";
      if (correctAnswers.length === 1) plural = " is ";
      let allCorrect = true;
      
      feedback = [
        "You selected " +
          selAnswers.length +
          " answer(s). There" +
          plural +
          correctAnswers.length +
          " correct answer(s).",
      ];

      // Compare teacher-marked correct beats with student selections
      correctAnswers.forEach((corr) => {
        const found = selAnswers.find(
          (s) =>
            s.measurePos == corr.measurePos && s.beatIndex == corr.beatIndex
        );
        if (!found) {
          allCorrect = false;
          if (corr.selectedTimes === '3') {
            if (instruments[Number(corr.staffPos)] !== undefined) {
              feedback = [
                ...feedback,
                `\nMissing correct beat: Measure ${Number(corr.measurePos) + 1} in the ${instruments[Number(corr.staffPos)]}, Beat ?`
              ];
            } else {
              feedback = [
                ...feedback,
                `\nMissing correct beat: Measure ${Number(corr.measurePos) + 1}, Beat ?`
              ];
            }
          } else {
            if (instruments[Number(corr.staffPos)] !== undefined) {
              feedback = [
                ...feedback,
                `\nTry checking Measure ${Number(corr.measurePos) + 1} in the ${instruments[Number(corr.staffPos)]} staff more carefully!`
              ];
            } else {
              feedback = [
                ...feedback,
                `\nTry checking Measure ${Number(corr.measurePos) + 1} more carefully!`
              ];
            }
          }
        }
      });
      
      selAnswers.forEach((sel) => {
        const found = correctAnswers.find(
          (c) =>
            c.measurePos == sel.measurePos && c.beatIndex == sel.beatIndex
        );
        if (!found) {
          allCorrect = false;
          if (sel.beatIndex) {
            if (instruments[Number(sel.staffPos)] !== undefined) {
              feedback = [
                ...feedback,
                `\nIncorrect beat selected: Measure ${Number(sel.measurePos) + 1} in the ${instruments[Number(sel.staffPos)]}, Beat ${sel.beatIndex}.`
              ];
            }
            else {
              feedback = [
                ...feedback,
                `\nIncorrect beat selected: Measure ${Number(sel.measurePos) + 1}, Beat ${sel.beatIndex}.`
              ];
            }
          } else {
            if (instruments[Number(sel.abselem.elemset[0].getAttribute("staffPos"))] !== undefined) {
              feedback = [
                ...feedback,
                `\nWrong answer selected at Measure ${Number(sel.abselem.elemset[0].getAttribute("measurePos")) + 1} in the ${instruments[Number(sel.abselem.elemset[0].getAttribute("staffPos"))]} staff.`
              ];
            } else {
              feedback = [
                ...feedback,
                `\nWrong answer selected at Measure ${Number(sel.abselem.elemset[0].getAttribute("measurePos")) + 1}.`
              ];
            }
          }
          
        }
      });
      if (allCorrect) {
        feedback = ["Great job!"];
      }
      setCustomFeedback([...feedback]);
      return;
    }

    // Existing logic for non-rhythm exercises:
    var tmpSelected = [...selAnswers];
    var tmpCorrect = [...correctAnswers];
    var feedback: string[] = [];

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

    let closeList: Number[] = [];
    let wrongList = [];

    for (
      var i = 0, j = 0;
      i < correctAnswers.length &&
      j < selAnswers.length &&
      tmpCorrect[i] !== undefined;
    ) {
      let noteElems = tmpSelected[j].abselem.elemset[0];
      if (noteElems.getAttribute("index") === tmpCorrect[i]["index"]) {
        if (
          noteElems.getAttribute("selectedTimes") ===
          tmpCorrect[i]["selectedTimes"]
        )
          tmpCorrect = tmpCorrect.filter(function (ans) {
            return ans["index"] !== tmpCorrect[i]["index"];
          });
        else closeList.push(Number(tmpCorrect[i]["index"]));
        j++;
      } else if (noteElems.getAttribute("index") > tmpCorrect[i]["index"]) i++;
      else if (noteElems.getAttribute("index") < tmpCorrect[i]["index"]) {
        wrongList.push(noteElems);
        j++;
      }
    }

    if (
      tmpCorrect.length === 0 &&
      tmpSelected.length === correctAnswers.length
    ) {
      feedback = ["Great job identifying the errors in this passage!"];
    } else if (tmpSelected.length !== correctAnswers.length) {
      var plural = " are ";
      if (correctAnswers.length === 1) plural = " is ";
      feedback = [`\nYou selected ${selAnswers.length} answer(s). There  ${plural} ${correctAnswers.length} correct answer(s).`];

      for (let i = 0; i < tmpCorrect.length; i++) {
        feedback = [
          ...feedback,
          `\nTry checking Measure ${Number(tmpCorrect[i]["measurePos"]) + 1} in the ${instruments[Number(tmpCorrect[i]["staffPos"])]} staff more carefully!`
        ];
        highlightMeasure(wrongList, tmpCorrect);
      }
      for (let i = 0; i < wrongList.length; i++) {
        feedback = [
          ...feedback,
          `\nWrong answer selected at Measure ${Number(wrongList[i].getAttribute("measurePos")) + 1} in the ${instruments[Number(wrongList[i].getAttribute("staffPos"))]} staff!`
        ];
        highlightMeasure(wrongList, tmpCorrect);
      }
    } else if (tmpCorrect.length === correctAnswers.length) {
      feedback = [
        "Keep trying; the more you practice the better you will get.",
      ];
      for (let i = 0; i < tmpCorrect.length; i++) {
        feedback = [
          ...feedback,
          `\nTry checking Measure ${Number(tmpCorrect[i]["measurePos"]) + 1} in the ${instruments[Number(tmpCorrect[i]["staffPos"])]} staff more carefully!`
        ];
        highlightMeasure(wrongList, tmpCorrect);
        let addtlFeedback = tmpCorrect[i]["feedback"];
        if (
          closeList.includes(Number(tmpCorrect[i]["index"])) &&
          !tmpCorrect[i]["feedback"]
            .toString()
            .startsWith(
              "You've found where the error is (hurray!) but you've mis-identified the kind of error (try again!). "
            )
        )
          addtlFeedback =
            "You've found where the error is (hurray!) but you've mis-identified the kind of error (try again!). " +
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
    } else if (tmpCorrect.length < correctAnswers.length) {
      feedback = [
        "Good work – you've found some of the errors, but here are some specific places to look at and listen to more closely:",
      ];
      for (let i = 0; i < tmpCorrect.length; i++) {
        feedback = [
          ...feedback,
          `\nTry checking Measure ${Number(tmpCorrect[i]["measurePos"]) + 1} in the ${instruments[Number(tmpCorrect[i]["staffPos"])]} staff more carefully!`
        ];
        highlightMeasure(wrongList, tmpCorrect);
        let addtlFeedback = tmpCorrect[i]["feedback"];
        if (
          closeList.includes(Number(tmpCorrect[i]["index"])) &&
          !tmpCorrect[i]["feedback"]
            .toString()
            .startsWith(
              "You've found where the error is (hurray!) but you've mis-identified the kind of error (try again!). "
            )
        )
          addtlFeedback =
            "You've found where the error is (hurray!) but you've mis-identified the kind of error (try again!). " +
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

    setCustomFeedback([...feedback]);
  };

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

  const saveTitle = function () {
    var titleBox = document.getElementById("title");
    if (titleBox !== null && "value" in titleBox) {
      var str = titleBox.value as string;
      setCustomTitle(str);
      setEditingTitle(!editingTitle);
    }
  };

  const customTitleChange = function (
    tags: string[],
    diff: number,
    voices: number,
    types: string,
    meter: string,
    transpos: boolean
  ) {
    let exNum = findNum(tags, diff, voices, types, meter, transpos);
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

  const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    if (tags.includes(val)) {
      tags.splice(tags.indexOf(val), 1);
      setTags([...tags]);
      customTitleChange([...tags], diff, voices, types, meter, transpos);
    } else {
      setTags([...tags, val]);
      customTitleChange([...tags, val], diff, voices, types, meter, transpos);
    }
  };

  const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setVoices(Number(e.target.value));
  };

  const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setTypes(e.target.value);
    customTitleChange(tags, diff, voices, e.target.value, meter, transpos);
  };

  const meterChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setMeter(e.target.value);
    customTitleChange(tags, diff, voices, types, e.target.value, transpos);
  };

  const transposChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    setTranspos(!transpos);
    customTitleChange(tags, diff, voices, types, meter, !transpos);
  };

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

  const handleExerciseDelete = async (exIndex: number) => {
    try {
      const database = getDatabase();
      const exerciseRef = ref(database, `scores/${exIndex}`);
      const snapshot = await get(exerciseRef);
      if (snapshot.exists()) {
        var exTitle = title;
        await remove(exerciseRef);
        console.log("exercise deleted from the database!");
        const updatedExercises = allExData.filter((exercise) => {
          return exercise && exercise.exIndex !== exIndex;
        });
        setAllExData(updatedExercises);
        alert("exercise " + exTitle + " deleted!");
        window.location.reload();
      } else {
        console.log("exercise with" + exIndex + " not found!");
        alert("exercise not found.");
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("error deleting exercise.");
    }
  };

  return (
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
      {editingTitle && teacherMode ? (
        <span>
          <textarea id="title">{customTitle}</textarea>
          <button onClick={saveTitle}>Save Title</button>
        </span>
      ) : (
        <h3 onClick={() => setEditingTitle(!editingTitle)}>{customTitle}</h3>
      )}
      {teacherMode ? (
        <span>
          <div id="forms" style={{ display: "inline-flex", padding: "4px" }}>
            <form id="tags">
              Tags:
              <br />
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
              <br />
              <select name="voices" defaultValue={voices} onChange={voiceChange}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </form>
            <form id="difficulty">
              Difficulty:
              <br />
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
              <br />
              <select name="meter" defaultValue={types} onChange={meterChange}>
                <option value="Anything">Anything</option>
                <option value="Simple">Simple</option>
                <option value="Compound">Compound</option>
              </select>
            </form>
            <form id="types">
              Textural Factors:
              <br />
              <select name="types" defaultValue={types} onChange={typesChange}>
                <option value="None">None</option>
                <option value="Drone">Drone</option>
                <option value="Ensemble Parts">Ensemble Parts</option>
                <option value="Both">Drone & Ensemble Parts</option>
              </select>
            </form>
            <form id="transpos">
              Transposing Instruments:
              <br />
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
          {mp3File.name === "" ? <br /> : <></>}
          {(exerciseData !== undefined && !exerciseData.empty && !loaded) ||
          (abcFile !== undefined && abcFile !== "" && !loaded) ? (
            <button onClick={loadScore}>Load Score</button>
          ) : (
            <></>
          )}
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
        <span>
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
          {abcFile !== undefined && abcFile !== "" && loaded ? (
            <div>
              <button className="btnback" onClick={checkAnswers}>
                Check Answer
              </button>
              <div>
                Next step(s):
                {customFeedback.map(function (feedback) {
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
