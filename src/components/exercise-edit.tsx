import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExerciseData from "../interfaces/exerciseData";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { getDatabase, ref, set, get } from "firebase/database";
import { getStorage, ref as storageRef, getBlob } from "firebase/storage";
import { vertaal } from "xml2abc";
import "../styles/create-exercise.css";

// Import the new components
import { ExerciseForm } from "./exercise-creation/exercise-form";
import { ExerciseControls } from "./exercise-creation/exercise-controls";
import { ExerciseTypeFiles } from "./exercise-creation/exercise-type-files";
import { ScorePreview } from "./exercise-creation/score-preview";

interface EditExercisePageProps {
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  refreshExercises: () => Promise<void>;
}

export function EditExercisePage({ allExData, setAllExData, refreshExercises }: EditExercisePageProps) {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();

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
  const [originalExercise, setOriginalExercise] = useState<ExerciseData | null>(null);
  const [exerciseKey, setExerciseKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showContent, setShowContent] = useState<boolean>(false);
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
  const [originalAudioFile, setOriginalAudioFile] = useState<string>("");
  const [originalMusicXmlFile, setOriginalMusicXmlFile] = useState<string>("");

  // Load exercise data on component mount
  useEffect(() => {
    const loadExerciseData = async () => {
      if (!exerciseId) {
        navigate("/exercise-management");
        return;
      }

      try {
        const database = getDatabase();
        const exercisesRef = ref(database, 'scores');
        const snapshot = await get(exercisesRef);
        
        if (snapshot.exists()) {
          let foundExercise: ExerciseData | null = null;
          let foundKey = "";
          
          snapshot.forEach((childSnapshot) => {
            const exercise = childSnapshot.val();
            if (!exercise) return;
            
            const exerciseData: ExerciseData = new ExerciseData(
              exercise.score || "",
              exercise.sound || "",
              exercise.correctAnswers || [],
              exercise.feedback || "",
              exercise.exIndex || 0,
              exercise.empty || false,
              exercise.title || "",
              exercise.difficulty || 1,
              exercise.voices || 1,
              exercise.tags || [],
              exercise.types || "None",
              exercise.meter || "Anything",
              exercise.transpos || false,
              undefined,
              exercise.customId
            );
            
            // Check by customId or exIndex
            if ((exercise.customId && exercise.customId === exerciseId) || 
                exercise.exIndex.toString() === exerciseId) {
              foundExercise = exerciseData;
              foundKey = childSnapshot.key || "";
            }
          });
          
          if (foundExercise) {
            const exercise = foundExercise as ExerciseData;
            setOriginalExercise(exercise);
            setExerciseKey(foundKey);
            
            // Populate form fields
            setDifficulty(exercise.difficulty);
            setVoices(exercise.voices);
            setTags(exercise.tags || []);
            setTypes(exercise.types || "None");
            setMeter(exercise.meter || "Anything");
            setTranspos(exercise.transpos || false);
            setCustomId(exercise.customId || "");
            setAbcNotation(exercise.score || "");
            
            // Store original audio file name for display
            if (exercise.sound && typeof exercise.sound === 'string') {
              setOriginalAudioFile(exercise.sound);
              
              // Actually load the audio file from Firebase Storage
              try {
                const storage = getStorage();
                const audioRef = storageRef(storage, exercise.sound);
                const audioBlob = await getBlob(audioRef);
                const audioFileObj = new File([audioBlob], exercise.sound, { type: "audio/mpeg" });
                setAudioFile(audioFileObj);
              } catch (fileError) {
                console.error("Error loading audio file:", fileError);
              }
            }
            
            if (exercise.score) {
              setOriginalMusicXmlFile("musicxml.xml");
              // Note: MusicXML files aren't stored separately - they're converted to ABC notation
              // The ABC notation is already loaded in setAbcNotation above
            }
          } else {
            alert("Exercise not found");
            navigate("/exercise-management");
          }
        } else {
          alert("No exercises found");
          navigate("/exercise-management");
        }
      } catch (error) {
        console.error("Error loading exercise:", error);
        alert("Error loading exercise");
        navigate("/exercise-management");
      } finally {
        setIsLoading(false);
        // Show content after 0.75 seconds
        setTimeout(() => {
          setShowContent(true);
        }, 750);
      }
    };

    loadExerciseData();
  }, [exerciseId, navigate]);

  // Check if score has been edited
  const hasScoreEdits = (): boolean => {
    return false;
  };

  // File removal handlers
  const handleFileRemoveRequest = (type: "musicxml" | "audio") => {
    if (type === "musicxml" && hasScoreEdits()) {
      setFileToRemoveType(type);
      setShowFileRemoveModal(true);
    } else {
      setIsRemovingFile(true);
      removeFile(type);
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

    // For editing, files are optional unless we want to replace them
    // But if we had original files, we should keep them

    if (customId && !/^[a-zA-Z0-9_-]+$/.test(customId.trim())) {
      errors.push("Custom ID contains invalid characters");
      newFieldErrors.customId = true;
    }

    if (customId && allExData.some(ex => ex?.customId === customId.trim() && ex !== originalExercise)) {
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

  // Submit exercise (update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateExercise()) {
      setShowValidationErrorModal(true);
      return;
    }

    if (!exerciseKey) {
      alert("Error: Exercise key not found");
      return;
    }

    try {
      const database = getDatabase();
      const exerciseRef = ref(database, `scores/${exerciseKey}`);
      
      const updatedExercise = {
        title: originalExercise?.title || `Exercise ${originalExercise?.exIndex}`,
        score: abcNotation || originalExercise?.score || "",
        sound: audioFile?.name || originalExercise?.sound || "audio.mp3",
        correctAnswers: originalExercise?.correctAnswers || [],
        feedback: originalExercise?.feedback || "Default feedback for wrong answers",
        exIndex: originalExercise?.exIndex || 0,
        empty: originalExercise?.empty || false,
        difficulty: difficulty,
        voices: voices,
        tags: tags,
        types: types,
        meter: meter,
        transpos: transpos,
        isNew: false,
        customId: customId || undefined,
        pitchCorrectNotes: originalExercise?.correctAnswers || []
      };
      
      await set(exerciseRef, updatedExercise);
      
      await refreshExercises();
      
      alert("Exercise updated successfully!");
      
      setTimeout(() => {
        navigate("/exercise-management");
      }, 100);
    } catch (error) {
      console.error("Error updating exercise:", error);
      alert("Error updating exercise. Please try again.");
    }
  };

  const hasUnsavedData = (): boolean => {
    if (!originalExercise) return false;
    
    // Check if audioFile is a newly uploaded file (not the loaded one)
    const hasNewAudioFile = audioFile && originalAudioFile && audioFile.name !== originalAudioFile;
    const hasNewMusicXmlFile = musicXmlFile && originalMusicXmlFile && musicXmlFile.name !== originalMusicXmlFile;
    
    return (
      customId !== (originalExercise.customId || "") ||
      difficulty !== originalExercise.difficulty ||
      voices !== originalExercise.voices ||
      JSON.stringify(tags) !== JSON.stringify(originalExercise.tags || []) ||
      types !== (originalExercise.types || "None") ||
      meter !== (originalExercise.meter || "Anything") ||
      transpos !== originalExercise.transpos ||
      hasNewAudioFile ||
      hasNewMusicXmlFile ||
      abcNotation !== originalExercise.score
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

  if (isLoading || !showContent) {
    return (
      <div className="loading-indicator">
        <div className="loading-content-compact">
          <div className="loading-spinner-compact">
            <div className="spinner-compact"></div>
          </div>
          <p className="loading-text-compact">Loading data...</p>
        </div>
      </div>
    );
  }

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
                  isEdit={true}
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
                          isEdit={true}
                          originalAudioFile={originalAudioFile}
                          originalMusicXmlFile={originalMusicXmlFile}
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
