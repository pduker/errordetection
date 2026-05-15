import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExerciseData from "../interfaces/exerciseData";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { ExerciseSuccessModal } from "./modals/ExerciseSuccessModal";
import { getDatabase, ref, get, remove, child, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";

import "../styles/create-exercise.css";

import { ExerciseForm } from "./exercise-creation/exercise-form";
import { ExerciseTypeFiles } from "./exercise-creation/exercise-type-files";
import { ExerciseControls } from "./exercise-creation/exercise-controls";
import { Exercise } from "./exercise";
import DBData from "../interfaces/DBData";

interface CreateExercisePageProps {
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  refreshExercises: () => Promise<void>;
}

export function CreateExercisePage({ allExData, setAllExData, refreshExercises }: CreateExercisePageProps) {
  const navigate = useNavigate();
  const params = useParams();

  const exerciseIdParam = params.exerciseId;
  const exIndex = parseInt(typeof exerciseIdParam === "string" ? exerciseIdParam : "error");

  const [exerciseData, setExerciseData] = useState<ExerciseData>(
    allExData.find(ex => ex?.exIndex === exIndex) ||
    new ExerciseData(
      "", // score / abc
      undefined, // sound
      [], // correctAnswers
      "", // feedback
      exIndex, // exIndex
      true, // empty
      `Exercise ${exIndex}`, // title
      1, // difficulty
      1, // voices
      [], // tags
      "None", // types
      "Anything", // meter
      false, // transpos
      true, // isNew
      "" // customId
    )
  );

  const [difficulty, setDifficulty] = useState<number>(exerciseData.difficulty);
  const [voices, setVoices] = useState<number>(exerciseData.voices);
  const [tags, setTags] = useState<string[]>(exerciseData.tags);
  const [types, setTypes] = useState<string>(exerciseData.types);
  const [meter, setMeter] = useState<string>(exerciseData.meter);
  const [transpos, setTranspos] = useState<boolean>(exerciseData.transpos);
  const [customId, setCustomId] = useState<string>(exerciseData.customId || "");

  useEffect(() => {
    exerciseData.difficulty = difficulty;
    exerciseData.voices = voices;
    exerciseData.tags = tags;
    exerciseData.types = types;
    exerciseData.meter = meter;
    exerciseData.transpos = transpos;
    exerciseData.customId = customId;

    setExerciseData(exerciseData);
  }, [difficulty, voices, tags, types, meter, transpos, customId]);

  const isEditing = !exerciseData.isNew;

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [musicXmlFile, setMusicXmlFile] = useState<File | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<"back" | "cancel" | null>(null);
  const [showFileErrorModal, setShowFileErrorModal] = useState<boolean>(false);
  const [fileErrorType, setFileErrorType] = useState<"audio" | "musicxml" | null>(null);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showFileRemoveModal, setShowFileRemoveModal] = useState<boolean>(false);
  const [fileToRemoveType, setFileToRemoveType] = useState<"musicxml" | "audio" | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string>("");
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

  const exerciseComponentRef = useRef();

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

  const handleFileUpload = (file: File, type: "musicxml" | "audio") => {
    if (type === "musicxml") {
      if (!file.name.match(/\.(xml|musicxml)$/i)) {
        setFileErrorType("musicxml");
        setShowFileErrorModal(true);
        return;
      }
      (exerciseComponentRef.current as any).setMusicXmlFile(file);
      setMusicXmlFile(file);
    } else if (type === "audio") {
      if (!file.name.match(/\.mp3$/i)) {
        setFileErrorType("audio");
        setShowFileErrorModal(true);
        return;
      }
      (exerciseComponentRef.current as any).setAudioFile(file);
      setAudioFile(file);
    }
  }

  const removeFile = (type: "musicxml" | "audio") => {
    if (type === "musicxml") {
      setMusicXmlFile(null);
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

    if (exerciseData.correctAnswers.length === 0) {
      errors.push("Please select at least one correct answer");
    }

    if (exerciseData.tags.length === 0) {
      errors.push("Please select at least one exercise type");
      newFieldErrors.tags = true;
    }

    if (!musicXmlFile && !exerciseData.score) {
      errors.push("Please upload a MusicXML file");
      newFieldErrors.musicXml = true;
    }

    if (!audioFile && !exerciseData.sound) {
      errors.push("Please upload an audio file");
      newFieldErrors.audio = true;
    }

    // Clear field errors when validation passes
    if (exerciseData.customId && exerciseData.customId.trim() !== "" && !/^[a-zA-Z0-9_-]+$/.test(exerciseData.customId.trim())) {
      errors.push("Custom ID contains invalid characters");
      newFieldErrors.customId = true;
    } else if (!exerciseData.customId || exerciseData.customId.trim() === "") {
      newFieldErrors.customId = false;
    }

    if (!isEditing && exerciseData.customId && exerciseData.customId.trim() !== "" && allExData.some(ex => ex?.customId === exerciseData?.customId?.trim())) {
      errors.push("Custom ID is already in use");
      newFieldErrors.customId = true;
    } else if (!exerciseData.customId || exerciseData.customId.trim() === "") {
      newFieldErrors.customId = false;
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

  const syncExerciseComponentAndData = () => {
    // sync score and correctAnswers from exerciseComponentRef
    const componentData = (exerciseComponentRef.current as any).getDataToSync();

    exerciseData.score = componentData.score;
    exerciseData.correctAnswers = componentData.correctAnswers;
    setExerciseData(exerciseData);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    syncExerciseComponentAndData();

    if (!validateExercise()) { // check to see if data is valid
      setShowValidationErrorModal(true);
      return;
    }

    // if so, proceed with exercise creation!
    try {
      // copied from old exercise.tsx save function
      exerciseData.correctAnswers.sort((i1, i2) => {
        if ((i1.index as number) > (i2.index as number)) return 1;
        if ((i1.index as number) < (i2.index as number)) return -1;
        return 0;
      });
      const data = new ExerciseData(
        exerciseData.score,
        exerciseData.sound,
        exerciseData.correctAnswers,
        "",
        exerciseData.exIndex,
        false,
        (exerciseComponentRef.current as any).getCustomTitle() || exerciseData.title,
        exerciseData.difficulty,
        exerciseData.voices,
        exerciseData.tags,
        exerciseData.types,
        exerciseData.meter,
        exerciseData.transpos,
        false,
        exerciseData.customId
      );

      if (audioFile === null) throw new Error("Audio file is null");

      const database = getDatabase();
      const storage = getStorage();

      const scoresRef = ref(database, "scores");
      const audioRef = storageRef(storage, audioFile.name);

      await uploadBytes(audioRef, audioFile);
      const dbDataRef = child(scoresRef, exerciseData.exIndex.toString());

      const snapshot = await get(dbDataRef);
      if (snapshot.exists()) {
        // update existing exercise
        const updatedData = new DBData(data, audioFile.name);
        await set(dbDataRef, updatedData);
        console.log("Exercise data was updated!");

        await refreshExercises();
        setSuccessMessage("Exercise updated successfully!");
        setShowSuccessModal(true);
      } else {
        // create new exercise
        const newData = new DBData(data, audioFile.name);
        await set(dbDataRef, newData);
        console.log("New exercise added!");

        await refreshExercises();
        setSuccessMessage("Exercise created successfully!");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error saving exercise: ", error);
      alert("Error saving exercise. Please try again.");
    }
  }

  const handleSuccessModalOk = () => {
    setShowSuccessModal(false);
    // Add a small delay to ensure the state is updated before navigation
    setTimeout(() => {
      navigate("/exercise-management");
    }, 100);
  };

  const hasUnsavedData = (): boolean => {
    return (
      (exerciseData.customId && exerciseData.customId.trim() !== "") ||
      exerciseData.difficulty !== 1 ||
      exerciseData.voices !== 1 ||
      exerciseData.tags.length > 0 ||
      exerciseData.types !== "None" ||
      exerciseData.meter !== "Anything" ||
      exerciseData.transpos !== false ||
      audioFile !== null ||
      musicXmlFile !== null
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

  useEffect(() => {
    (exerciseComponentRef.current as any).updateDataFromExerciseCreation(
      difficulty,
      tags,
      types,
      meter,
      transpos,
      voices
    );
  }, [difficulty, tags, types, meter, transpos, voices]);

  if (Number.isNaN(exIndex)) {
    alert(`Couldn't find an exercise with ID ${exerciseIdParam}!`);
    navigate("/exercise-management");
  }

  return (
    <div className="exercise-creation-container">
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <div className="exercise-viewer">
          <div className="exercise-stage">
            <div className="exercise-content"> 
              <div className="exercise-content-inner">
                <ExerciseControls 
                  onCreateExercise={() => handleSubmit(new Event('submit') as any)}
                  onCancel={handleCancel}
                  isEdit={isEditing}
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
                          sound={exerciseData.sound || audioFile || undefined}
                          isEditing={isEditing}
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
                    <Exercise
                      exIndex={exIndex}
                      teacherMode={true}
                      ExData={exerciseData}
                      allExData={[]}
                      updateProgress={() => {}}
                      setAllExData={() => {}}
                      handleSelectExercise={undefined}
                      isSelected={undefined}
                      fetch={undefined}
                      filtersOpen={false}
                      setFiltersOpen={() => {}}
                      teacherModeRef={exerciseComponentRef}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </form>

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
        show={showFileRemoveModal}
        onHide={handleFileRemoveCancel}
        onConfirm={handleFileRemoveConfirm}
        title="Confirm File Removal"
        message={`Are you sure you want to remove the ${fileToRemoveType} file?`}
        confirmText="Remove"
        cancelText="Cancel"
      />
      
      <ExerciseSuccessModal
        show={showSuccessModal}
        onOk={handleSuccessModalOk}
        message={successMessage}
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
