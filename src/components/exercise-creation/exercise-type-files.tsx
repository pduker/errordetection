import React, { useRef, useEffect } from "react";
import { getStorage, ref as storageRef, getBlob } from "firebase/storage";

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
  isEdit?: boolean;
  originalAudioFile?: string;
  originalMusicXmlFile?: string;
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
  allExData,
  isEdit = false,
  originalAudioFile = "",
  originalMusicXmlFile = ""
}: ExerciseTypeFilesProps) {
  const musicXmlInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const loadOriginalFile = async (fileName: string, fileType: "audio" | "musicxml"): Promise<void> => {
    try {
      const storage = getStorage();
      const fileRef = storageRef(storage, fileName);
      const fileBlob = await getBlob(fileRef);
      
      if (fileType === "audio") {
        const audioFileObj = new File([fileBlob], fileName, { type: "audio/mpeg" });
        setAudioFile(audioFileObj);
      } else if (fileType === "musicxml") {
        const musicXmlFileObj = new File([fileBlob], fileName, { type: "application/xml" });
        setMusicXmlFile(musicXmlFileObj);
      }
    } catch (fileError) {
      console.error("Error loading original file:", fileError);
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

  // Load original files when in edit mode OR save files to storage in create mode
  useEffect(() => {
    if (isEdit && originalAudioFile && !audioFile) {
      // Load audio file from Firebase Storage
      loadOriginalFile(originalAudioFile, "audio");
    }
    
    if (isEdit && originalMusicXmlFile && !musicXmlFile) {
      // Load MusicXML file from Firebase Storage
      loadOriginalFile(originalMusicXmlFile, "musicxml");
    }
  }, [isEdit, originalAudioFile, originalMusicXmlFile, audioFile, musicXmlFile, setAudioFile, setMusicXmlFile]);

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
          className={`exercise-input ${fieldErrors.customId ? "error" : ""}`}
        />
        <button
          type="button"
          onClick={() => setCustomId("")}
          className="remove-id-btn"
          title="Remove custom ID"
          disabled={!customId || customId.trim() === ""}
        >
          ✕
        </button>
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
        <div className="file-upload-item">
          <label>Score</label>
          <input
            type="file"
            accept=".xml,.musicxml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "musicxml");
            }}
            className={`file-input ${musicXmlFile ? "file-present" : ""}`}
          />
          {fieldErrors.musicXml && !musicXmlFile && (!isEdit || !originalMusicXmlFile) && (
          <div className="field-error-message">MusicXML file required</div>
          )}
        </div>
        
        <div className="file-upload-item">
          <label>Audio</label>
          <input
            type="file"
            accept=".mp3,.wav,.m4a"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "audio");
            }}
            className={`file-input ${audioFile ? "file-present" : ""}`}
          />
          {fieldErrors.audio && !audioFile && (!isEdit || !originalAudioFile) && (
          <div className="field-error-message">Audio file required</div>
          )}
        </div>
      </div>
    </div>
  );
}
