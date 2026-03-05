import React, { useState, useRef, useEffect } from "react";
import abcjs from "abcjs";
import { FeedbackType, MarkedNote, getNoteColor, FEEDBACK_COLORS } from "../../types/feedback-types";

interface ScorePreviewProps {
  abcNotation: string;
  selectedNotes: {note: string, measure: string}[];
  rhythmCorrect: MarkedNote[];
  pitchCorrect: MarkedNote[];
  feedbackNotes: {id: string, type: FeedbackType, text: string, targetNote?: string, targetMeasure?: string}[];
  onSelectionChange: (notes: {note: string, measure: string}[]) => void;
  onNoteClick: (note: string, measure: string) => void;
  resetSelection: boolean;
  resetCounter?: number;
  lastMarkedNotes: {note: string, measure: string}[];
}

export function ScorePreview({ 
  abcNotation, 
  selectedNotes, 
  rhythmCorrect,
  pitchCorrect,
  feedbackNotes,
  onSelectionChange, 
  onNoteClick,
  resetSelection,
  resetCounter,
  lastMarkedNotes
}: ScorePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [selNotes, setSelNotes] = useState<any[]>([]);
  const [allClickedNotes, setAllClickedNotes] = useState<any[]>([]); // Store all notes that have been clicked
  const [markedNotes, setMarkedNotes] = useState<{rhythm: string[], pitch: string[]}>({rhythm: [], pitch: []}); // Track marked notes by element

  // Reset internal selection when parent signals reset
  useEffect(() => {
    if (resetSelection || (resetCounter && resetCounter > 0)) {
      setSelNotes([]);
    }
  }, [resetSelection, resetCounter]);

  // Update marked notes when rhythmCorrect, pitchCorrect, or lastMarkedNotes change
  useEffect(() => {
    const newRhythmElements: string[] = [];
    const newPitchElements: string[] = [];
    
    // Only process if we have lastMarkedNotes (notes that were just marked)
    if (lastMarkedNotes.length > 0) {
      // Find the corresponding note objects in all clicked notes
      allClickedNotes.forEach(note => {
        if (note && note.abselem && note.abselem.elemset) {
          // Get measure info the same way as in clickListener - check all elements
          let measureCt = 1; // default
          let noteName = 'note';
          
          // Find the element with measurePos attribute
          for (let i = 0; i < note.abselem.elemset.length; i++) {
            const elem = note.abselem.elemset[i];
            const elemMeasurePos = elem.getAttribute("measurePos");
            if (elemMeasurePos) {
              measureCt = Number(elemMeasurePos) + 1;
              break;
            }
          }
          
          noteName = note.pitches && note.pitches.length > 0 
            ? (typeof note.pitches[0] === 'string' ? note.pitches[0] : note.pitches[0].name || 'note')
            : 'note';
          
          const noteInfo = {
            note: noteName,
            measure: measureCt.toString()
          };
          
          // Check if this note matches any of the last marked notes
          const matchingMarkedNote = lastMarkedNotes.find(marked => 
            marked.note === noteInfo.note && marked.measure === noteInfo.measure
          );
          
          if (matchingMarkedNote) {
            const isRhythmCorrect = rhythmCorrect.some((n: MarkedNote) => n.note === noteInfo.note && n.measure === noteInfo.measure);
            const isPitchCorrect = pitchCorrect.some((n: MarkedNote) => n.note === noteInfo.note && n.measure === noteInfo.measure);
            
            if (isRhythmCorrect) {
              note.abselem.elemset.forEach((elem: any) => {
                newRhythmElements.push(elem.toString());
              });
            }
            if (isPitchCorrect) {
              note.abselem.elemset.forEach((elem: any) => {
                newPitchElements.push(elem.toString());
              });
            }
          }
        }
      });
    }
    
    // Replace marked notes instead of accumulating
    setMarkedNotes({
      rhythm: newRhythmElements,
      pitch: newPitchElements
    });
  }, [rhythmCorrect, pitchCorrect, lastMarkedNotes, allClickedNotes]);

  // Helper function from abcjs for highlighting (similar to main exercise page)
  const setClass = function (
    elemset: any,
    addClass: any,
    removeClass: any,
    color: any,
  ) {
    if (!elemset) return;
    for (var i = 0; i < elemset.length; i++) {
      var el = elemset[i];
      // Always use the fill attribute for note heads to ensure proper color control
      el.setAttribute("fill", color);
      var kls = el.getAttribute("class");
      if (!kls) kls = "";
      if (removeClass) {
        kls = kls.replace(removeClass, "");
      }
      if (addClass) {
        kls = kls.replace(addClass, "");
        if (kls.length > 0 && kls[kls.length - 1] !== " ") kls += " ";
        kls += addClass;
      }
      el.setAttribute("class", kls);
    }
  };

  // Highlighting function (similar to main exercise page)
  const highlight = function (note: any, klass: any, clicked: boolean): number {
    if (
      !note ||
      !note.abselem ||
      !note.abselem.elemset ||
      note.abselem.elemset.length === 0
    ) {
      return 0;
    }
    var retval = 0;
    var noteElems = note.abselem.elemset[0];
    var selTim = Number(noteElems.getAttribute("selectedTimes")) || 0;
    if (clicked) selTim++;
    
    if (selTim === 3) {
      selTim = 0;
      retval = 1;
    } else if (selTim > 3) {
      selTim %= 3;
    }
    
    if (klass === undefined) klass = "abcjs-note_selected";
    var color = "#000000";
    
    // Check if this note is marked as rhythm or pitch correct
    const noteInfo = {
      note: note.pitches && note.pitches.length > 0 
        ? (typeof note.pitches[0] === 'string' ? note.pitches[0] : note.pitches[0].name || 'note')
        : 'note',
      measure: (Number(noteElems.getAttribute("measurePos")) + 1).toString()
    };
    
    const isRhythmCorrect = rhythmCorrect.some((n: MarkedNote) => n.note === noteInfo.note && n.measure === noteInfo.measure && n.rhythmCorrect === true);
    const isPitchCorrect = pitchCorrect.some((n: MarkedNote) => n.note === noteInfo.note && n.measure === noteInfo.measure && n.pitchCorrect === true);
    
    if (isRhythmCorrect) {
      color = FEEDBACK_COLORS.rhythmCorrect; // green for rhythm correct
    } else if (isPitchCorrect) {
      color = FEEDBACK_COLORS.pitchCorrect; // blue for pitch correct
    } else if (selTim === 1) {
      color = FEEDBACK_COLORS.selected; // orange
    } else if (selTim === 2) {
      color = FEEDBACK_COLORS.neutral; // black
    }
    // If selTim is 0, color stays black (this handles deselection)
    
    if (clicked) {
      noteElems.setAttribute("selectedTimes", selTim.toString());
    }
    
    setClass(note.abselem.elemset, klass, "", color);
    return retval;
  };

  // Click listener for notes (similar to main exercise page)
  const clickListener = function (
    abcelem: any,
    tuneNumber: number,
    classes: string,
    analysis: abcjs.ClickListenerAnalysis,
    drag: abcjs.ClickListenerDrag,
  ) {
    var note = abcelem;
    if (
      !note ||
      !note.abselem ||
      !note.abselem.elemset ||
      note.abselem.elemset.length === 0
    ) {
      return;
    }
    var noteElems = note.abselem.elemset[0];

    // Find if note is already in selection array
    const existingIndex = selNotes.findIndex(n => n === note);
    
    // Add note to all clicked notes if not already there
    const clickedIndex = allClickedNotes.findIndex(n => n === note);
    if (clickedIndex === -1) {
      console.log('Adding note to allClickedNotes:', note);
      setAllClickedNotes(prev => [...prev, note]);
    }
    
    if (existingIndex === -1) {
      // Note not in array - add it
      selNotes.push(note);
    } else {
      // Note already in array - remove it (this handles the third click case)
      selNotes.splice(existingIndex, 1);
    }

    // Apply highlighting to ALL selected notes (like main exercise page)
    for (var i = 0; i < selNotes.length; i++) {
      if (selNotes[i] === note) {
        if (highlight(selNotes[i], undefined, true) === 1) {
          selNotes.splice(i, 1);
          i--;
        }
      } else {
        if (highlight(selNotes[i], undefined, false) === 1) {
          selNotes.splice(i, 1);
          i--;
        }
      }
    }

    // Update state
    setSelNotes([...selNotes]);

    // Get note information for callback
    var staffCt = Number(noteElems.getAttribute("staffPos")) + 1,
      measureCt = Number(noteElems.getAttribute("measurePos")) + 1;
    var noteName = note.pitches && note.pitches.length > 0 
      ? (typeof note.pitches[0] === 'string' ? note.pitches[0] : note.pitches[0].name || 'note')
      : 'note';
    
    onNoteClick(noteName, measureCt.toString());

    // Update selected notes for feedback
    const selectedNotesForFeedback = selNotes.map(n => {
      const elems = n.abselem.elemset[0];
      const staffPos = Number(elems.getAttribute("staffPos")) + 1;
      const measurePos = Number(elems.getAttribute("measurePos")) + 1;
      const nName = n.pitches && n.pitches.length > 0 
        ? (typeof n.pitches[0] === 'string' ? n.pitches[0] : n.pitches[0].name || 'note')
        : 'note';
      return {
        note: nName,
        measure: measurePos.toString()
      };
    });
    onSelectionChange(selectedNotesForFeedback);
  };

  // Function to reset all highlighting when abcNotation changes
  const resetHighlighting = () => {
    setSelNotes([]);
  };

  useEffect(() => {
    if (abcNotation && previewRef.current) {
      // Clear internal selection before re-rendering
      setSelNotes([]);
      
      try {
        abcjs.renderAbc(previewRef.current, abcNotation, {
          responsive: "resize",
          lineThickness: 0.4,
          add_classes: true,
          staffwidth: 800,
          wrap: {
            minSpacing: 1.0,
            maxSpacing: 2.5,
            preferredMeasuresPerLine: 4
          },
          clickListener: clickListener,
          selectTypes: ["note"]
        });
      } catch (error) {
        console.error('Error rendering ABC notation:', error);
      }
    }
  }, [abcNotation, resetCounter]);

  useEffect(() => {
    // Re-apply highlighting when rhythm/pitch notes change or selection changes
    // Also reset if selectedNotes becomes empty (Clear All was clicked)
    if (previewRef.current) {
      const svgElement = previewRef.current.querySelector('svg');
      if (svgElement) {
        // Get all note elements
        const allNoteElements = svgElement.querySelectorAll('[class*="note"]');
        
        allNoteElements.forEach((element) => {
          // Find the corresponding note object for selection
          const noteObj = selNotes.find(n => {
            if (!n || !n.abselem || !n.abselem.elemset || n.abselem.elemset.length === 0) return false;
            const elems = n.abselem.elemset;
            return Array.from(elems).some(el => el === element);
          });
          
          // Check if this element is marked as rhythm or pitch correct
          const elementStr = element.toString();
          const isMarkedRhythm = markedNotes.rhythm.includes(elementStr);
          const isMarkedPitch = markedNotes.pitch.includes(elementStr);
          
          if (noteObj) {
            // Note is selected - apply selection highlighting
            highlight(noteObj, undefined, false);
          } else if (isMarkedRhythm) {
            // Note is marked as rhythm correct - apply green
            const elems = [element];
            setClass(elems, "abcjs-note_selected", "", FEEDBACK_COLORS.rhythmCorrect);
          } else if (isMarkedPitch) {
            // Note is marked as pitch correct - apply blue
            const elems = [element];
            setClass(elems, "abcjs-note_selected", "", FEEDBACK_COLORS.pitchCorrect);
          } else {
            // Note is not selected or marked - turn it off (back to black) and reset selectedTimes
            const elems = [element];
            // Reset selectedTimes to 0
            element.setAttribute("selectedTimes", "0");
            // Apply black color directly without going through highlight function
            setClass(elems, "abcjs-note_selected", "", FEEDBACK_COLORS.neutral);
          }
        });
      }
    }
  }, [rhythmCorrect, pitchCorrect, selectedNotes, markedNotes]);

  useEffect(() => {
    // Clean up highlighting when component unmounts
    return () => {
      resetHighlighting();
    };
  }, []);

  return (
    <div className="score-preview-section">
      <div className="preview-header">
        <h4>Score Preview</h4>
      </div>
      <div className="score-preview-container">
        <div 
          className="score-preview-content"
          style={{ position: 'relative', userSelect: 'none' }}
        >
          {abcNotation ? (
            <div 
              ref={previewRef}
              className="abc-score-display"
            />
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              Drop a MusicXML file above to see the score preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
