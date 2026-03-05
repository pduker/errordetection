import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import ExerciseData from "../interfaces/exerciseData";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { Exercise } from "./exercise";
import { getDatabase, ref, set, push } from "firebase/database";
import { vertaal } from "xml2abc";
import "../styles/create-exercise.css";

// Import the new components
import { ExerciseForm } from "./exercise-creation/exercise-form";
import { ExerciseTypeFiles } from "./exercise-creation/exercise-type-files";
import { ScorePreview } from "./exercise-creation/score-preview";
import { FeedbackSection } from "./exercise-creation/feedback-section";
import { ExerciseControls } from "./exercise-creation/exercise-controls";
import { FeedbackType, MarkedNote, createFeedbackItem, updateNoteMarking, removeNoteMarking } from "../types/feedback-types";

interface CreateExercisePageProps {
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  refreshExercises: () => Promise<void>;
}

export function CreateExercisePage({ allExData, setAllExData, refreshExercises }: CreateExercisePageProps) {
  const navigate = useNavigate();

  // State management
  const [difficulty, setDifficulty] = useState<number>(1);
  const [voices, setVoices] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [types, setTypes] = useState<string>("None");
  const [meter, setMeter] = useState<string>("Anything");
  const [transpos, setTranspos] = useState<boolean>(false);
  const [customId, setCustomId] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [musicXmlFile, setMusicXmlFile] = useState<File | null>(null);
  const [abcNotation, setAbcNotation] = useState<string>("");
  const [feedbackItems, setFeedbackItems] = useState<{id: string, type: FeedbackType, text: string, targetNote?: string, targetMeasure?: string}[]>([]);
  const [selectedNote, setSelectedNote] = useState<{note: string, measure: string} | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<{note: string, measure: string}[]>([]);
  const [rhythmCorrect, setRhythmCorrect] = useState<MarkedNote[]>([]);
  const [pitchCorrect, setPitchCorrect] = useState<MarkedNote[]>([]);
  const [dragOver, setDragOver] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<"back" | "cancel" | null>(null);
  const [showFileErrorModal, setShowFileErrorModal] = useState<boolean>(false);
  const [fileErrorType, setFileErrorType] = useState<"audio" | "musicxml" | null>(null);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showFileRemoveModal, setShowFileRemoveModal] = useState<boolean>(false);
  const [fileToRemoveType, setFileToRemoveType] = useState<"musicxml" | "audio" | null>(null);
  const [isRemovingFile, setIsRemovingFile] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{
    tags: boolean;
    musicXml: boolean;
    audio: boolean;
    customId: boolean;
  }>({
    tags: false,
    musicXml: false,
    audio: false,
    customId: false
  });

  // Check if score has been edited
  const hasScoreEdits = (): boolean => {
    return selectedNotes.length > 0 || feedbackItems.length > 0 || rhythmCorrect.length > 0 || pitchCorrect.length > 0;
  };

  // File removal handlers
  const handleFileRemoveRequest = (type: "musicxml" | "audio") => {
    if (type === "musicxml" && hasScoreEdits()) {
      setFileToRemoveType(type);
      setShowFileRemoveModal(true);
    } else {
      setIsRemovingFile(true);
      removeFile(type);
      // Clear score-related state when removing MusicXML
      if (type === "musicxml") {
        setSelectedNotes([]);
        setFeedbackItems([]);
        setSelectedNote(null);
        setRhythmCorrect([]);
        setPitchCorrect([]);
      }
      setIsRemovingFile(false);
    }
  };

  const handleFileRemoveConfirm = () => {
    setIsRemovingFile(true);
    if (fileToRemoveType) {
      removeFile(fileToRemoveType);
      // Clear score-related state when removing MusicXML
      if (fileToRemoveType === "musicxml") {
        setSelectedNotes([]);
        setFeedbackItems([]);
        setSelectedNote(null);
        setRhythmCorrect([]);
        setPitchCorrect([]);
      }
    }
    setShowFileRemoveModal(false);
    setFileToRemoveType(null);
    setIsRemovingFile(false);
  };

  const handleFileRemoveCancel = () => {
    setShowFileRemoveModal(false);
    setFileToRemoveType(null);
  };

  // File handling functions
  const handleFileUpload = (file: File, type: "musicxml" | "audio") => {
    if (type === "musicxml") {
      if (!file.name.match(/\.(xml|musicxml)$/i)) {
        setFileErrorType("musicxml");
        setShowFileErrorModal(true);
        return;
      }
      setMusicXmlFile(file);
      
      // Convert MusicXML to ABC notation
      const reader = new FileReader();
      reader.onload = (e) => {
        const xmlContent = e.target?.result as string;
        try {
          const domparser = new DOMParser();
          const xmldata = domparser.parseFromString(xmlContent, 'application/xml');
          
          const options = { u:0, b:0, n:0,
            c:0, v:0, d:0,  
            m:0, x:0, t:0,  
            v1:0, noped:0,  
            stm:0,          
            p:'f', s:0 };
          
          const result = vertaal(xmldata, options);
          const abcText = result[0];
          
          setAbcNotation(abcText);
        } catch (error) {
          console.error("Error converting MusicXML to ABC:", error);
          setAbcNotation("");
        }
      };
      reader.readAsText(file);
    } else if (type === "audio") {
      if (!file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
        setFileErrorType("audio");
        setShowFileErrorModal(true);
        return;
      }
      setAudioFile(file);
    }
    setDragOver("");
  };

  const removeFile = (type: "musicxml" | "audio") => {
    if (type === "musicxml") {
      setMusicXmlFile(null);
      setAbcNotation("");
    } else {
      setAudioFile(null);
    }
  };

  // Validation functions
  const validateExercise = () => {
    // Skip validation if we're showing a file removal modal or in the process of removing
    if (isRemovingFile || showFileRemoveModal) {
      return true;
    }
    
    const errors: string[] = [];
    const newFieldErrors = {
      tags: false,
      musicXml: false,
      audio: false,
      customId: false
    };

    if (tags.length === 0) {
      errors.push("Please select at least one exercise type");
      newFieldErrors.tags = true;
    }

    if (!musicXmlFile) {
      errors.push("Please upload a MusicXML file");
      newFieldErrors.musicXml = true;
    }

    if (!audioFile) {
      errors.push("Please upload an audio file");
      newFieldErrors.audio = true;
    }

    if (customId && !/^[a-zA-Z0-9_-]+$/.test(customId.trim())) {
      errors.push("Custom ID contains invalid characters");
      newFieldErrors.customId = true;
    }

    if (customId && allExData.some(ex => ex?.customId === customId.trim())) {
      errors.push("Custom ID is already in use");
      newFieldErrors.customId = true;
    }

    setFieldErrors(newFieldErrors);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Modal and navigation functions
  const getModalMessage = () => {
    if (confirmAction === "back") {
      return "Are you sure you want to go back? Any unsaved changes will be lost.";
    } else if (confirmAction === "cancel") {
      return "Are you sure you want to cancel? Any unsaved changes will be lost.";
    }
    return "";
  };

  const handleModalConfirm = () => {
    if (confirmAction === "back") {
      navigate("/exercise-management");
    } else if (confirmAction === "cancel") {
      // Reset form or navigate away
      setAllExData([]);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleModalCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getFileErrorMessage = () => {
    if (fileErrorType === "audio") {
      return "Please upload a valid audio file (MP3, WAV, OGG, M4A, or AAC).";
    } else if (fileErrorType === "musicxml") {
      return "Please upload a valid MusicXML file (.xml or .musicxml).";
    }
    return "";
  };

  const handleFileErrorConfirm = () => {
    setShowFileErrorModal(false);
    setFileErrorType(null);
  };

  const handleValidationErrorConfirm = () => {
    setShowValidationErrorModal(false);
    setValidationErrors([]);
  };

  

  // Clear selection function
  const clearSelection = () => {
    // First clear - remove selected notes from rhythm and pitch lists if they exist there
    const notesToRemove = selectedNotes.length > 0 ? selectedNotes : (selectedNote ? [selectedNote] : []);
    
    setRhythmCorrect(prev => prev.filter(n => 
      !notesToRemove.some(selected => selected.note === n.note && selected.measure === n.measure)
    ));
    
    setPitchCorrect(prev => prev.filter(n => 
      !notesToRemove.some(selected => selected.note === n.note && selected.measure === n.measure)
    ));
    
    setSelectedNotes([]);
    setSelectedNote(null);
    
    // Second clear - simulate selecting another note to trigger the full clearing
    // This mimics the behavior where selecting a note after clearing triggers another clear
    setTimeout(() => {
      setResetCounter(prev => prev + 1); // Trigger reset in ScorePreview to clear internal selNotes
    }, 0);
  };

  // Clear all notes function
  const [resetCounter, setResetCounter] = useState(0);
  const [justMarkedNotes, setJustMarkedNotes] = useState<{note: string, measure: string}[]>([]);
  const clearAllNotes = () => {
    // First clear - clear all the state arrays
    setSelectedNotes([]);
    setSelectedNote(null);
    setRhythmCorrect([]);
    setPitchCorrect([]);
    
    // Second clear - simulate selecting another note to trigger the full clearing
    // This mimics the behavior where selecting a note after clearing triggers another clear
    setTimeout(() => {
      setResetCounter(prev => prev + 1); // Increment to trigger reset in child
    }, 0);
  };

  // Handle note selection from score preview
  const handleNoteSelection = (notes: {note: string, measure: string}[]) => {
    setSelectedNotes(notes);
    setSelectedNote(null); // Clear single selection when using multi-selection
  };

  // Handle individual note click
  const handleNoteClick = (note: string, measure: string) => {
    setSelectedNote({ note, measure });
    setSelectedNotes([]); // Clear multi-selection when using single selection
  };

  // Handle marking selected notes as rhythm correct
  const markAsRhythmCorrect = () => {
    const notesToAdd = selectedNotes.length > 0 ? selectedNotes : (selectedNote ? [selectedNote] : []);
    
    // Store the notes that are being marked before clearing selection
    setJustMarkedNotes(notesToAdd);
    
    notesToAdd.forEach(note => {
      setRhythmCorrect(prev => updateNoteMarking(prev, note, { rhythmCorrect: true }));
      // Remove from pitch correct if it was there (mutually exclusive for now)
      setPitchCorrect(prev => removeNoteMarking(prev, note));
    });
    
    // Clear the selection but don't remove from rhythm correct
    setSelectedNotes([]);
    setSelectedNote(null);
    
    // Trigger a special marking event for the score preview
    setResetCounter(prev => prev + 1);
    
    // Clear justMarkedNotes after a short delay to prevent re-triggering
    setTimeout(() => setJustMarkedNotes([]), 100);
  };

  // Handle marking selected notes as pitch correct
  const markAsPitchCorrect = () => {
    const notesToAdd = selectedNotes.length > 0 ? selectedNotes : (selectedNote ? [selectedNote] : []);
    
    // Store the notes that are being marked before clearing selection
    setJustMarkedNotes(notesToAdd);
    
    notesToAdd.forEach(note => {
      setPitchCorrect(prev => updateNoteMarking(prev, note, { pitchCorrect: true }));
      // Remove from rhythm correct if it was there (mutually exclusive for now)
      setRhythmCorrect(prev => removeNoteMarking(prev, note));
    });
    
    // Clear the selection but don't remove from pitch correct
    setSelectedNotes([]);
    setSelectedNote(null);
    
    // Trigger a special marking event for the score preview
    setResetCounter(prev => prev + 1);
    
    // Clear justMarkedNotes after a short delay to prevent re-triggering
    setTimeout(() => setJustMarkedNotes([]), 100);
  };

  // Remove note from rhythm or pitch lists
  const removeFromRhythm = (noteToRemove: {note: string, measure: string}) => {
    setRhythmCorrect(prev => removeNoteMarking(prev, noteToRemove));
  };

  const removeFromPitch = (noteToRemove: {note: string, measure: string}) => {
    setPitchCorrect(prev => removeNoteMarking(prev, noteToRemove));
  };

  // Submit exercise
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateExercise()) {
      setShowValidationErrorModal(true);
      return;
    }

    try {
      const database = getDatabase();
      const exercisesRef = ref(database, 'exercises');
      
      // Create a new exercise entry
      const newExerciseRef = push(exercisesRef);
      const newId = newExerciseRef.key;
      
      const newExercise = new ExerciseData(
        abcNotation || "",
        audioFile?.name || "audio.mp3",
        rhythmCorrect.map(n => ({note: n.note})),
        feedbackItems.map(item => item.text).join('; ') || "Default feedback for wrong answers",
        allExData.length,
        false,
        `Exercise ${allExData.length + 1}`,
        difficulty,
        voices,
        tags,
        types,
        meter,
        transpos,
        true, // isNew
        customId || undefined
      );
      
      await set(newExerciseRef, {
        title: newExercise.title,
        score: newExercise.score,
        sound: newExercise.sound,
        correctAnswers: newExercise.correctAnswers,
        feedback: newExercise.feedback,
        exIndex: newExercise.exIndex,
        empty: newExercise.empty,
        difficulty: newExercise.difficulty,
        voices: newExercise.voices,
        tags: newExercise.tags,
        types: newExercise.types,
        meter: newExercise.meter,
        transpos: newExercise.transpos,
        isNew: newExercise.isNew,
        customId: newExercise.customId,
        // Add pitch correct notes for feedback purposes
        pitchCorrectNotes: pitchCorrect.map(n => ({note: n.note, measure: n.measure, pitchCorrect: n.pitchCorrect}))
      });
      
      // Refresh the exercises list from database
      await refreshExercises();
      
      alert("Exercise created successfully!");
      
      // Add a small delay to ensure the state is updated before navigation
      setTimeout(() => {
        navigate("/exercise-management");
      }, 100);
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert("Error saving exercise. Please try again.");
    }
  };

  const hasUnsavedData = (): boolean => {
    return (
      customId.trim() !== "" ||
      difficulty !== 1 ||
      voices !== 1 ||
      tags.length > 0 ||
      types !== "None" ||
      meter !== "Anything" ||
      transpos !== false ||
      audioFile !== null ||
      musicXmlFile !== null ||
      abcNotation !== "" ||
      feedbackItems.length > 0 ||
      rhythmCorrect.length > 0 ||
      pitchCorrect.length > 0
    );
  };

  const handleBackToManagement = () => {
    if (hasUnsavedData()) {
      setConfirmAction("back");
      setShowConfirmModal(true);
    } else {
      navigate("/exercise-management");
    }
  };

  const handleCancel = () => {
    if (hasUnsavedData()) {
      setConfirmAction("cancel");
      setShowConfirmModal(true);
    } else {
      navigate("/exercise-management");
    }
  };

  return (
    <div className="exercise-creation-container">
      <form onSubmit={handleSubmit}>
        <div className="exercise-viewer">
          <div className="exercise-stage">
            <div className="exercise-content"> 
              <div className="exercise-content-inner">
                <ExerciseControls 
                  onCreateExercise={() => handleSubmit(new Event('submit') as any)}
                  onCancel={handleCancel}
                />

                <div className="exercise-main-card">
                  <div className="creation-workspace">
                    <div className="workspace-grid">
                      {/* Left side - Exercise Properties */}
                      <div className="workspace-left">
                        <ExerciseForm
                          difficulty={difficulty}
                          setDifficulty={setDifficulty}
                          voices={voices}
                          setVoices={setVoices}
                          tags={tags}
                          setTags={setTags}
                          types={types}
                          setTypes={setTypes}
                          meter={meter}
                          setMeter={setMeter}
                          transpos={transpos}
                          setTranspos={setTranspos}
                          customId={customId}
                          setCustomId={setCustomId}
                          fieldErrors={fieldErrors}
                        />
                      </div>

                      {/* Right side - Exercise Type & Files */}
                      <div className="workspace-right">
                        <ExerciseTypeFiles
                          tags={tags}
                          setTags={setTags}
                          types={types}
                          setTypes={setTypes}
                          customId={customId}
                          setCustomId={setCustomId}
                          musicXmlFile={musicXmlFile}
                          setMusicXmlFile={setMusicXmlFile}
                          audioFile={audioFile}
                          setAudioFile={setAudioFile}
                          handleFileUpload={handleFileUpload}
                          removeFile={handleFileRemoveRequest}
                          fieldErrors={fieldErrors}
                          allExData={allExData}
                        />    
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Preview and Feedback Section - Separate Section */}
                <div className="inner-score-feedback-section">
                  <div className="score-feedback-header">
                    <h3>Score Preview & Feedback</h3>
                  </div>
                  <div className="score-feedback-content">
                    <ScorePreview
                      abcNotation={abcNotation}
                      selectedNotes={selectedNotes}
                      rhythmCorrect={rhythmCorrect}
                      pitchCorrect={pitchCorrect}
                      feedbackNotes={feedbackItems}
                      onSelectionChange={handleNoteSelection}
                      onNoteClick={handleNoteClick}
                      resetSelection={selectedNotes.length === 0 && rhythmCorrect.length === 0 && pitchCorrect.length === 0}
                      resetCounter={resetCounter}
                      lastMarkedNotes={justMarkedNotes}
                    />

                    <FeedbackSection 
                      feedbackItems={feedbackItems}
                      setFeedbackItems={setFeedbackItems}
                      selectedNote={selectedNote}
                      selectedNotes={selectedNotes}
                      rhythmCorrect={rhythmCorrect}
                      pitchCorrect={pitchCorrect}
                      onMarkAsRhythmCorrect={markAsRhythmCorrect}
                      onMarkAsPitchCorrect={markAsPitchCorrect}
                      onRemoveFromRhythm={removeFromRhythm}
                      onRemoveFromPitch={removeFromPitch}
                      onClearSelection={clearSelection}
                      onClearAllNotes={clearAllNotes}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={handleModalCancel}
        onConfirm={handleModalConfirm}
        title="Unsaved Changes"
        message={getModalMessage()}
        confirmText="Yes, Proceed"
        cancelText="No, Stay Here"
      />
      
      <ConfirmationModal
        show={showFileErrorModal}
        onHide={handleFileErrorConfirm}
        onConfirm={handleFileErrorConfirm}
        title="Invalid File Type"
        message={getFileErrorMessage()}
        confirmText="OK"
        hideCancelButton={true}
      />
      
      <ConfirmationModal
        show={showValidationErrorModal}
        onHide={handleValidationErrorConfirm}
        onConfirm={handleValidationErrorConfirm}
        title="Validation Errors"
        message={validationErrors.join('\n\n')}
        confirmText="Fix Issues"
        hideCancelButton={true}
      />
      
      <ConfirmationModal
        show={showFileRemoveModal}
        onHide={handleFileRemoveCancel}
        onConfirm={handleFileRemoveConfirm}
        title="Remove File with Score Edits"
        message="You have made edits to the score (selected notes or feedback items). Removing the MusicXML file will discard all these edits. Are you sure you want to continue?"
        confirmText="Yes, Remove File"
        cancelText="No, Keep File"
      />
    </div>
  );
}
