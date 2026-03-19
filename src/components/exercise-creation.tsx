import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExerciseData from "../interfaces/exerciseData";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { getDatabase, ref, set, push } from "firebase/database";
import { vertaal } from "xml2abc";
import "../styles/create-exercise.css";

// Import the new components
import { ExerciseForm } from "./exercise-creation/exercise-form";
import { ExerciseTypeFiles } from "./exercise-creation/exercise-type-files";
import { ScorePreview } from "./exercise-creation/score-preview";
import { ExerciseControls } from "./exercise-creation/exercise-controls";

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
    return false; // No score edits possible since we removed note selection
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
        // Nothing to clear since we removed note selection
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
        // Nothing to clear since we removed note selection
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
      // Navigate back to management on cancel
      navigate("/exercise-management");
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
      const exercisesRef = ref(database, 'scores');
      
      // Create a new exercise entry
      const newExerciseRef = push(exercisesRef);
      
      // Generate a unique exIndex based on existing exercises
      const existingIndexes = allExData.map(ex => ex?.exIndex || 0).filter(index => index !== undefined);
      const maxIndex = existingIndexes.length > 0 ? Math.max(...existingIndexes) : 0;
      const newExIndex = maxIndex + 1;
      
      const newExercise = new ExerciseData(
        abcNotation || "",
        audioFile?.name || "audio.mp3",
        [], // No correct answers needed
        "Default feedback for wrong answers",
        newExIndex,
        false,
        `Exercise ${newExIndex}`,
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
        pitchCorrectNotes: []
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
      abcNotation !== ""
    );
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

                {/* Score Preview Section - Separate Section */}
                <div className="inner-score-feedback-section">
                  <div className="score-feedback-header">
                    <h3>Score Preview</h3>
                  </div>
                  <div className="score-feedback-content">
                    <ScorePreview
                      abcNotation={abcNotation}
                      selectedNotes={[]}
                      rhythmCorrect={[]}
                      pitchCorrect={[]}
                      feedbackNotes={[]}
                      onSelectionChange={() => {}}
                      onNoteClick={() => {}}
                      resetSelection={false}
                      resetCounter={0}
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
