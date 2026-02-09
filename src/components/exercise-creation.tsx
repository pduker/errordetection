import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import ExerciseData from "../interfaces/exerciseData";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { getDatabase, ref, set, push } from "firebase/database";
import "../styles/create-exercise.css";

interface CreateExercisePageProps {
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  refreshExercises: () => Promise<void>;
}

export function CreateExercisePage({ allExData, setAllExData, refreshExercises }: CreateExercisePageProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>(""); // Keep for internal logic but won't be shown in UI
  const [difficulty, setDifficulty] = useState<number>(1);
  const [voices, setVoices] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [types, setTypes] = useState<string>("None");
  const [meter, setMeter] = useState<string>("Anything");
  const [transpos, setTranspos] = useState<boolean>(false);
  const [customId, setCustomId] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [musicXmlFile, setMusicXmlFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<"back" | "cancel" | null>(null);
  const [showFileErrorModal, setShowFileErrorModal] = useState<boolean>(false);
  const [fileErrorType, setFileErrorType] = useState<"audio" | "musicxml" | null>(null);
  
  useEffect(() => {
    // Component initialization logic here if needed
  }, []);

  const clearAllData = () => {
    // Clear form data (except title which is auto-generated)
    setDifficulty(1);
    setVoices(1);
    setTags([]);
    setTypes("None");
    setMeter("Anything");
    setTranspos(false);
    setCustomId("");
    setAudioFile(null);
    setMusicXmlFile(null);
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
      musicXmlFile !== null
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

  const handleModalConfirm = () => {
    setShowConfirmModal(false);
    navigate("/exercise-management");
  };

  const handleModalCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getModalMessage = (): string => {
    if (confirmAction === "back") {
      return "Are you sure you want to go back to the management page? Your changes will not be saved.";
    } else if (confirmAction === "cancel") {
      return "Are you sure you want to cancel? Your changes will not be saved.";
    }
    return "";
  };

  const handleFileErrorConfirm = () => {
    setShowFileErrorModal(false);
    setFileErrorType(null);
  };

  const getFileErrorMessage = (): string => {
    if (fileErrorType === "audio") {
      return "Please drop a valid audio file!\nValid formats: .mp3, .wav, .m4a";
    } else if (fileErrorType === "musicxml") {
      return "Please drop a valid MusicXML file!\nValid formats: .xml, .musicxml";
    }
    return "";
  };

  const handleTagChange = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp3':
      case 'wav':
      case 'm4a':
        return '💿';
      case 'xml':
      case 'musicxml':
        return '🎼';
      default:
        return '📄';
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver('');
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver('');

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      if (type === 'audio') {
        const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
        if (!audioTypes.includes(file.type) || !file.name.match(/\.(mp3|wav|m4a)$/i)) {
          setFileErrorType('audio');
          setShowFileErrorModal(true);
          return;
        }
        setAudioFile(file);
      } else if (type === 'musicxml') {
        const xmlTypes = ['application/xml', 'text/xml'];
        if (!xmlTypes.includes(file.type) || !file.name.match(/\.(xml|musicxml)$/i)) {
          setFileErrorType('musicxml');
          setShowFileErrorModal(true);
          return;
        }
        setMusicXmlFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
        if (!audioTypes.includes(file.type) || !file.name.match(/\.(mp3|wav|m4a)$/i)) {
          setFileErrorType('audio');
          setShowFileErrorModal(true);
          return;
        }
        setAudioFile(file);
      } else if (type === 'musicxml') {
        const xmlTypes = ['application/xml', 'text/xml'];
        if (!xmlTypes.includes(file.type) || !file.name.match(/\.(xml|musicxml)$/i)) {
          setFileErrorType('musicxml');
          setShowFileErrorModal(true);
          return;
        }
        setMusicXmlFile(file);
      }
    }
  };

  const removeFile = (type: string) => {
    if (type === 'audio') {
      setAudioFile(null);
    } else if (type === 'musicxml') {
      setMusicXmlFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Generate automatic title based on exercise index
      const maxIndex = allExData.reduce((max, exercise) => {
        if (exercise && exercise.exIndex > max) {
          return exercise.exIndex;
        }
        return max;
      }, -1);
      const newExIndex = maxIndex + 1;
      const autoTitle = `Exercise ${newExIndex + 1}`;

      // Create new exercise with the generated index and auto title
      const newExercise = new ExerciseData(
        "",
        audioFile?.name || "", // Store filename instead of File object
        [],
        "",
        newExIndex,
        false,
        autoTitle, // Use auto-generated title
        difficulty,
        voices,
        tags,
        types,
        meter,
        transpos,
        true,
        customId,
      );

      // Save to Firebase database
      const database = getDatabase();
      const exerciseRef = ref(database, `scores/${newExIndex}`);
      
      await set(exerciseRef, {
        score: newExercise.score,
        sound: newExercise.sound,
        correctAnswers: newExercise.correctAnswers,
        feedback: newExercise.feedback,
        exIndex: newExercise.exIndex,
        empty: newExercise.empty,
        title: newExercise.title,
        difficulty: newExercise.difficulty,
        voices: newExercise.voices,
        tags: newExercise.tags,
        types: newExercise.types,
        meter: newExercise.meter,
        transpos: newExercise.transpos,
        customId: newExercise.customId
      });

      console.log("Exercise saved to database successfully:", newExercise);
      
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

  return (
    <>
      <div className="create-exercise-container">
      <div className="create-exercise-header">
        <div className="header-left">
          <h2 className="create-exercise-title">Create New Exercise</h2>
        </div>
        <div className="header-right">
          <button
            onClick={clearAllData}
            className="clear-all-button"
            title="Clear all form data"
          >
            Clear All
          </button>
          <button
            onClick={handleBackToManagement}
            className="back-button"
          >
            Back to Management
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-exercise-form">
        {/* Exercise Properties */}
        <div className="form-section">
          <h3>Exercise Properties</h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="form-select"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Voices:</label>
              <select
                value={voices}
                onChange={(e) => setVoices(Number(e.target.value))}
                className="form-select"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meter:</label>
              <select
                value={meter}
                onChange={(e) => setMeter(e.target.value)}
                className="form-select"
              >
                <option value="Anything">Anything</option>
                <option value="Simple">Simple</option>
                <option value="Compound">Compound</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Textural Factors:</label>
              <select
                value={types}
                onChange={(e) => setTypes(e.target.value)}
                className="form-select"
              >
                <option value="None">None</option>
                <option value="Drone">Drone</option>
                <option value="Ensemble Parts">Ensemble Parts</option>
                <option value="Both">Drone & Ensemble Parts</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={transpos}
                onChange={(e) => setTranspos(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-label">Transposing Instruments</span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3>Exercise Type</h3>
          <div className="tags-container">
            {["Pitch", "Intonation", "Rhythm"].map((tag) => (
              <label
                key={tag}
                className={`tag-item ${tags.includes(tag) ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  style={{ display: "none" }}
                />
                <span className="checkbox-label">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* File Uploads */}
        <div className="form-section">
          <h3>Files</h3>
          
          <div className="form-group file-upload-group">
            <label className="form-label">MusicXML Score (.xml, .musicxml):</label>
            <div 
              className={`file-drop-zone ${dragOver === 'musicxml' ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'musicxml')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'musicxml')}
            >
              <input
                type="file"
                accept=".musicxml,.xml"
                onChange={(e) => handleFileSelect(e, 'musicxml')}
                className="file-input"
              />
              <div className="file-upload-content">
                <div className="file-upload-icon">🎼</div>
                <div className="file-upload-text">
                  {musicXmlFile ? 'Replace MusicXML File' : 'Drop MusicXML file here or click to browse'}
                </div>
                <div className="file-upload-subtext">
                  Supports .xml, .musicxml files
                </div>
              </div>
            </div>
            {musicXmlFile && (
              <div className="file-preview">
                <div className="file-preview-icon">{getFileIcon(musicXmlFile.name)}</div>
                <div className="file-preview-info">
                  <div className="file-preview-name">{musicXmlFile.name}</div>
                  <div className="file-preview-details">{formatFileSize(musicXmlFile.size)}</div>
                </div>
                <button 
                  className="file-preview-remove"
                  onClick={() => removeFile('musicxml')}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-group file-upload-group">
            <label className="form-label">Audio File (.mp3, .wav, .m4a):</label>
            <div 
              className={`file-drop-zone ${dragOver === 'audio' ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'audio')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'audio')}
            >
              <input
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={(e) => handleFileSelect(e, 'audio')}
                className="file-input"
              />
              <div className="file-upload-content">
                <div className="file-upload-icon">🔊</div>
                <div className="file-upload-text">
                  {audioFile ? 'Replace Audio File' : 'Drop audio file here or click to browse'}
                </div>
                <div className="file-upload-subtext">
                  Supports .mp3, .wav, .m4a files
                </div>
              </div>
            </div>
            {audioFile && (
              <div className="file-preview">
                <div className="file-preview-icon">{getFileIcon(audioFile.name)}</div>
                <div className="file-preview-info">
                  <div className="file-preview-name">{audioFile.name}</div>
                  <div className="file-preview-details">{formatFileSize(audioFile.size)}</div>
                </div>
                <button 
                  className="file-preview-remove"
                  onClick={() => removeFile('audio')}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Identification */}
        <div className="form-section">
          <h3>Identification</h3>

          <div className="form-group">
            <label className="form-label">Custom ID:</label>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter custom ID (optional)"
              className="form-input"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="btn-cancel"
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="btn-create">
            Create Exercise
          </Button>
        </div>
      </form>
    </div>
    
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
    </>
  );
}
