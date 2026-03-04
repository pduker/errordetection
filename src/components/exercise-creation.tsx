import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import ExerciseData from "../interfaces/exerciseData";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { Exercise } from "./exercise";
import { getDatabase, ref, set, push } from "firebase/database";
import abcjs from "abcjs";
import { vertaal } from "xml2abc";
import "../styles/create-exercise.css";

interface CreateExercisePageProps {
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  refreshExercises: () => Promise<void>;
}

export function CreateExercisePage({ allExData, setAllExData, refreshExercises }: CreateExercisePageProps) {
  const navigate = useNavigate();

  // const [title, setTitle] = useState<string>(""); // Keep for internal logic but won't be shown in UI
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
  const [dragOver, setDragOver] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<"back" | "cancel" | null>(null);
  const [showFileErrorModal, setShowFileErrorModal] = useState<boolean>(false);
  const [fileErrorType, setFileErrorType] = useState<"audio" | "musicxml" | null>(null);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
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
  
  const previewRef = useRef<HTMLDivElement>(null);

  const convertMusicXmlToAbc = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        try {
          const fileContent = fileReader.result as string;
          console.log('MusicXML file loaded, size:', fileContent.length);
          
          const domparser = new DOMParser();
          const xmldata = domparser.parseFromString(fileContent, 'application/xml');
          
          const options = { u:0, b:0, n:0,
            c:0, v:0, d:0,  
            m:0, x:0, t:0,  
            v1:0, noped:0,  
            stm:0,          
            p:'f', s:0 };
          
          const result = vertaal(xmldata, options);
          const abcText = result[0];
          
          console.log('ABC conversion result length:', abcText.length);
          console.log('ABC notation preview:', abcText.substring(0, 200) + '...');
          
          resolve(abcText);
        } catch (error) {
          console.error('Error converting MusicXML to ABC:', error);
          reject(error);
        }
      };
      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsText(file);
    });
  };

  useEffect(() => {
    // Component initialization logic here if needed
  }, []);

  useEffect(() => {
    if (abcNotation && previewRef.current) {
      console.log('Rendering ABC notation:', abcNotation);
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
          }
        });
      } catch (error) {
        console.error('Error rendering ABC notation:', error);
      }
    }
  }, [abcNotation]);

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
    setAbcNotation("");
    
    // Clear validation errors
    setValidationErrors([]);
    setFieldErrors({
      tags: false,
      musicXml: false,
      audio: false,
      customId: false
    });
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

  const validateExercise = (): boolean => {
    const errors: string[] = [];
    const newFieldErrors = {
      tags: false,
      musicXml: false,
      audio: false,
      customId: false
    };

    // Validate at least one exercise type is selected
    if (tags.length === 0) {
      errors.push("Please select at least one exercise type (Pitch, Intonation, or Rhythm)");
      newFieldErrors.tags = true;
    }

    // Validate MusicXML file is required
    if (!musicXmlFile) {
      errors.push("MusicXML file is required");
      newFieldErrors.musicXml = true;
    }

    // Validate Audio file is required
    if (!audioFile) {
      errors.push("Audio file is required");
      newFieldErrors.audio = true;
    }

    // Validate custom ID format if provided
    if (customId.trim() !== "") {
      // Check for valid characters (alphanumeric, hyphens, underscores only)
      if (!/^[a-zA-Z0-9_-]+$/.test(customId.trim())) {
        errors.push("Custom ID can only contain letters, numbers, hyphens, and underscores");
        newFieldErrors.customId = true;
      }
      
      // Check for unique custom ID
      const isDuplicate = allExData.some(exercise => 
        exercise && exercise.customId === customId.trim()
      );
      if (isDuplicate) {
        errors.push("This custom ID is already used by another exercise");
        newFieldErrors.customId = true;
      }
    }

    setValidationErrors(errors);
    setFieldErrors(newFieldErrors);
    
    return errors.length === 0;
  };

  const handleValidationErrorConfirm = () => {
    setShowValidationErrorModal(false);
    setValidationErrors([]);
  };

  const isFormValid = (): boolean => {
    return tags.length > 0 && musicXmlFile !== null && audioFile !== null && !fieldErrors.customId;
  };

  const handlePreview = () => {
    if (isFormValid()) {
      setShowPreviewModal(true);
    }
  };

  const handlePreviewClose = () => {
    setShowPreviewModal(false);
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
    console.log('Drag over event for:', type);
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag leave event');
    setDragOver('');
  };

  const handleDrop = async (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop event for:', type);
    setDragOver('');

    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files.length, files.map(f => f.name));
    
    if (files.length > 0) {
      const file = files[0];
      console.log('Processing file:', file.name, 'Type:', file.type);
      
      if (type === 'audio') {
        const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
        if (!audioTypes.includes(file.type) || !file.name.match(/\.(mp3|wav|m4a)$/i)) {
          setFileErrorType('audio');
          setShowFileErrorModal(true);
          return;
        }
        setAudioFile(file);
      } else if (type === 'musicxml') {
        console.log('Processing MusicXML file:', file.name);
        console.log('File type:', file.type);
        console.log('File extension check:', file.name.match(/\.(xml|musicxml)$/i));
        
        // More permissive file type checking
        const xmlTypes = ['application/xml', 'text/xml', ''];
        const hasValidExtension = file.name.match(/\.(xml|musicxml)$/i);
        
        if (!xmlTypes.includes(file.type) && !hasValidExtension) {
          console.log('File validation failed - type:', file.type, 'extension:', hasValidExtension);
          setFileErrorType('musicxml');
          setShowFileErrorModal(true);
          return;
        }
        
        console.log('File validation passed, setting MusicXML file');
        setMusicXmlFile(file);
        
        // Convert MusicXML to ABC for preview
        console.log('Starting MusicXML to ABC conversion for file:', file.name);
        try {
          const abc = await convertMusicXmlToAbc(file);
          console.log('ABC conversion successful, setting notation');
          setAbcNotation(abc);
        } catch (error) {
          console.error('Error converting MusicXML for preview:', error);
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
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
        console.log('Processing MusicXML file via file select:', file.name);
        console.log('File type:', file.type);
        console.log('File extension check:', file.name.match(/\.(xml|musicxml)$/i));
        
        // More permissive file type checking
        const xmlTypes = ['application/xml', 'text/xml', ''];
        const hasValidExtension = file.name.match(/\.(xml|musicxml)$/i);
        
        if (!xmlTypes.includes(file.type) && !hasValidExtension) {
          console.log('File validation failed - type:', file.type, 'extension:', hasValidExtension);
          setFileErrorType('musicxml');
          setShowFileErrorModal(true);
          return;
        }
        
        console.log('File validation passed, setting MusicXML file');
        setMusicXmlFile(file);
        
        // Convert MusicXML to ABC for preview
        console.log('Starting MusicXML to ABC conversion for file:', file.name);
        try {
          const abc = await convertMusicXmlToAbc(file);
          console.log('ABC conversion successful, setting notation');
          setAbcNotation(abc);
        } catch (error) {
          console.error('Error converting MusicXML for preview:', error);
        }
      }
    }
  };

  const removeFile = (type: string) => {
    if (type === 'audio') {
      setAudioFile(null);
    } else if (type === 'musicxml') {
      setMusicXmlFile(null);
      setAbcNotation("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateExercise()) {
      setShowValidationErrorModal(true);
      return;
    }

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
      <div className="exercise-viewer">
        <div className="exercise-stage">
          <div className="exercise-content"> 
            <div className="exercise-content-inner">
              {/* Exercise Header */}
              <div className="exercise-header">
                <h2 className="exercise-title">Create New Exercise</h2>
              </div>

              {/* Main Exercise Card - where musical notation would be */}
              <div className="exercise-main-card">
                <div className="creation-workspace">
                  <div className="workspace-grid">
                    {/* Left side - Exercise Properties */}
                    <div className="workspace-left">
                      <div className="property-section">
                        <h4>Exercise Properties</h4>
                        <div className="property-controls">
                          <div className="control-group">
                            <label>Difficulty:</label>
                            <div className="difficulty-selector">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setDifficulty(level)}
                                  className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="control-group">
                            <label>Voices:</label>
                            <div className="voice-selector">
                              {[1, 2, 3, 4, 5].map((voice) => (
                                <button
                                  key={voice}
                                  type="button"
                                  onClick={() => setVoices(voice)}
                                  className={`voice-btn ${voices === voice ? 'active' : ''}`}
                                >
                                  {voice}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="control-group">
                            <label>Meter:</label>
                            <select
                              value={meter}
                              onChange={(e) => setMeter(e.target.value)}
                              className="exercise-select"
                            >
                              <option value="Anything">Anything</option>
                              <option value="Simple">Simple</option>
                              <option value="Compound">Compound</option>
                            </select>
                          </div>

                          <div className="control-group">
                            <label>Textural Factors:</label>
                            <select
                              value={types}
                              onChange={(e) => setTypes(e.target.value)}
                              className="exercise-select"
                            >
                              <option value="None">None</option>
                              <option value="Drone">Drone</option>
                              <option value="Ensemble Parts">Ensemble Parts</option>
                              <option value="Both">Both</option>
                            </select>
                          </div>

                          <div className="control-group">
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
                      </div>
                      <div className="identification-section">
                        <label className="id-label">ID</label>
                        <div className="id-separator"></div>
                        <input
                          type="text"
                          value={customId}
                          onChange={(e) => setCustomId(e.target.value)}
                          placeholder="Custom ID (optional)"
                          className={`exercise-input ${fieldErrors.customId ? 'error' : ''}`}
                        />
                        {fieldErrors.customId && customId.trim() !== "" && (
                          <div className="field-error-message">
                            {!/^[a-zA-Z0-9_-]+$/.test(customId.trim()) 
                              ? "Invalid characters (use letters, numbers, hyphens, underscores only)"
                              : "This ID is already in use"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Exercise Type & Files */}
                    <div className="workspace-right">
                      <div className="type-section">
                        <h4>Exercise Type</h4>
                        <div className="exercise-tags">
                          {["Pitch", "Intonation", "Rhythm"].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagChange(tag)}
                              className={`exercise-tag ${tags.includes(tag) ? "selected" : ""} ${fieldErrors.tags && !tags.includes(tag) ? "error" : ""}`}
                            >
                              <span className="tag-label">{tag}</span>
                            </button>
                          ))}
                          {fieldErrors.tags && tags.length === 0 && (
                            <div className="field-error-message">Please select at least one type</div>
                          )}
                        </div>
                      </div>

                      <div className="files-section">
                        <h4>Files</h4>
                        <div className="file-upload-grid">
                          <div className="file-upload-item">
                            <label>MusicXML</label>
                            <div 
                              className={`file-drop-zone ${dragOver === 'musicxml' ? 'drag-over' : ''} ${fieldErrors.musicXml && !musicXmlFile ? 'error' : ''}`}
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
                              <div className="drop-content">
                                {musicXmlFile ? (
                                  <div className="file-info">
                                    <div className="file-details">
                                      <span className="file-icon">🎼</span>
                                      <span className="file-name" title={musicXmlFile.name}>
                                        {musicXmlFile.name}
                                      </span>
                                    </div>
                                    <button 
                                      className="clear-file-btn"
                                      onClick={() => removeFile('musicxml')}
                                      title="Remove file"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div className="drop-text">
                                    Drop file
                                  </div>
                                )}
                              </div>
                            </div>
                            {fieldErrors.musicXml && !musicXmlFile && (
                              <div className="field-error-message">MusicXML file required</div>
                            )}
                          </div>

                          <div className="file-upload-item">
                            <label>Audio</label>
                            <div 
                              className={`file-drop-zone ${dragOver === 'audio' ? 'drag-over' : ''} ${fieldErrors.audio && !audioFile ? 'error' : ''}`}
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
                              <div className="drop-content">
                                {audioFile ? (
                                  <div className="file-info">
                                    <div className="file-details">
                                      <span className="file-icon">💿</span>
                                      <span className="file-name" title={audioFile.name}>
                                        {audioFile.name}
                                      </span>
                                    </div>
                                    <button 
                                      className="clear-file-btn"
                                      onClick={() => removeFile('audio')}
                                      title="Remove file"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div className="drop-text">
                                    Drop file
                                  </div>
                                )}
                              </div>
                            </div>
                            {fieldErrors.audio && !audioFile && (
                              <div className="field-error-message">Audio file required</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Music Score Preview Section */}
                      {(abcNotation || true) && (
                        <div className="score-preview-section">
                          <div className="preview-header">
                            <h4>Score Preview</h4>
                            {/* <button 
                              className="preview-clear-btn"
                              onClick={() => setAbcNotation("")}
                            >
                              Clear Preview
                            </button> */}
                          </div>
                          <div className="score-preview-container">
                            <div className="score-preview-content">
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
                      )}


                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - like the exercise controls */}
              <div className="exercise-controls">
                <div className="controls-left">
                  <div className="exercise-type-indicator">
                    <span className="type-badge">Create Mode</span>
                  </div>
                </div>
                
                <div className="controls-right">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="control-btn cancel-btn"
                  >
                    Cancel
                  </button>
                  {/* <button
                    type="button"
                    onClick={handlePreview}
                    className={`control-btn preview-btn ${!isFormValid() ? 'disabled' : ''}`}
                    disabled={!isFormValid()}
                  >
                    Preview
                  </button> */}
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="control-btn create-btn"
                  >
                    Create Exercise
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    
    <ConfirmationModal
      show={showValidationErrorModal}
      onHide={handleValidationErrorConfirm}
      onConfirm={handleValidationErrorConfirm}
      title="Validation Errors"
      message={validationErrors.join('\n\n')}
      confirmText="Fix Issues"
      hideCancelButton={true}
    />
    
    {/* Exercise Preview Modal */}
    <Modal
      show={showPreviewModal}
      onHide={handlePreviewClose}
      centered
      backdrop="static"
      keyboard={false}
      size="xl"
      className="exercise-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Exercise Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0 }}>
        <div className="exercise-viewer" style={{ height: "600px" }}>
          <div className="exercise-stage">
            <div className="exercise-content"> 
              <div className="exercise-content-inner">
                {(() => {
                  // Create a mock exercise for preview
                  const mockExercise = new ExerciseData(
                    "T: Preview Exercise\nK:C\n|C D E F|G A B c|", // Mock ABC notation
                    audioFile?.name || "preview-audio.mp3", // Use actual filename or mock
                    [{"note": "C"}, {"note": "D"}], // Mock correct answers
                    "Preview exercise", // Mock feedback
                    allExData.length, // Use next available index
                    false, // empty
                    `Exercise ${allExData.length + 1}`, // Auto-generated title
                    difficulty,
                    voices,
                    tags,
                    types,
                    meter,
                    transpos,
                    true, // isNew
                    customId
                  );
                  
                  return (
                    <Exercise 
                      key={mockExercise.exIndex} 
                      teacherMode={false} 
                      ExData={mockExercise} 
                      allExData={[mockExercise]} 
                      setAllExData={() => {}} 
                      exIndex={mockExercise.exIndex} 
                      handleSelectExercise={undefined} 
                      isSelected={undefined}
                      fetch={undefined}
                      updateProgress={() => {}}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handlePreviewClose}>
          Close Preview
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}
