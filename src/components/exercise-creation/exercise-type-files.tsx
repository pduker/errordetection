import React, { useRef } from "react";

interface ExerciseTypeFilesProps {
  tags: string[];
  setTags: (value: string[]) => void;
  types: string;
  setTypes: (value: string) => void;
  customId: string;
  setCustomId: (value: string) => void;
  musicXmlFile: File | null;
  setMusicXmlFile: (value: File | null) => void;
  audioFile: File | null;
  setAudioFile: (value: File | null) => void;
  handleFileUpload: (file: File, type: "musicxml" | "audio") => void;
  removeFile: (type: "musicxml" | "audio") => void;
  fieldErrors: {
    tags: boolean;
    musicXml: boolean;
    audio: boolean;
    customId: boolean;
  };
  allExData: any[];
}

export function ExerciseTypeFiles({
  tags,
  setTags,
  customId,
  setCustomId,
  musicXmlFile,
  setMusicXmlFile,
  audioFile,
  setAudioFile,
  handleFileUpload,
  removeFile,
  fieldErrors,
  allExData
}: ExerciseTypeFilesProps) {
  const musicXmlInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: "musicxml" | "audio") => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const handleClearFile = (type: "musicxml" | "audio") => {
    removeFile(type);
    // Reset the file input value
    if (type === "musicxml" && musicXmlInputRef.current) {
      musicXmlInputRef.current.value = "";
    } else if (type === "audio" && audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="type-section">
        <h4>Exercise Type</h4>
        <div className="exercise-tags">
          {["Pitch", "Intonation", "Rhythm"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tags.includes(tag)) {
                  setTags(tags.filter((t) => t !== tag));
                } else {
                  setTags([...tags, tag]);
                }
              }}
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

      <div className="section-gap"></div>

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

      <div className="section-gap"></div>

      <div className="files-section">
        <h4>Files</h4>
        <div className="file-upload-grid">
          <div className="file-upload-item">
            <label>MusicXML</label>
            <div 
              className={`file-drop-zone ${fieldErrors.musicXml && !musicXmlFile ? 'error' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'musicxml')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'musicxml')}
            >
              <input
                ref={musicXmlInputRef}
                type="file"
                accept=".musicxml,.xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'musicxml');
                }}
                className={`file-input ${musicXmlFile ? 'file-present' : ''}`}
              />
              <div className="drop-content">
                {musicXmlFile ? (
                  <>
                    <div className="file-info">
                      <div className="file-details">
                        <span className="file-icon">🎼</span>
                        <span className="file-name" title={musicXmlFile.name}>
                          {musicXmlFile.name}
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="clear-file-btn"
                      onClick={() => handleClearFile('musicxml')}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="drop-text">
                    Click to browse or drag file
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
              className={`file-drop-zone ${fieldErrors.audio && !audioFile ? 'error' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'audio')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'audio')}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'audio');
                }}
                className={`file-input ${audioFile ? 'file-present' : ''}`}
              />
              <div className="drop-content">
                {audioFile ? (
                  <>
                    <div className="file-info">
                      <div className="file-details">
                        <span className="file-icon">💿</span>
                        <span className="file-name" title={audioFile.name}>
                          {audioFile.name}
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="clear-file-btn"
                      onClick={() => handleClearFile('audio')}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="drop-text">
                    Click to browse or drag file
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
    </div>
  );
}
