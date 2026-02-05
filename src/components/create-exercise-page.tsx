import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import '../styles/create-exercise.css';

export function CreateExercisePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [voices, setVoices] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [types, setTypes] = useState<string>('None');
  const [meter, setMeter] = useState<string>('Anything');
  const [transpos, setTranspos] = useState<boolean>(false);
  const [customId, setCustomId] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleTagChange = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExercise = new ExerciseData(
      '',
      audioFile || '',
      [],
      '',
      Date.now(),
      false,
      title || 'New Exercise',
      difficulty,
      voices,
      tags,
      types,
      meter,
      transpos,
      true,
      customId
    );

    console.log('Creating new exercise:', newExercise);
    alert('Exercise created! (Note: Database saving not implemented yet)');
    navigate('/exercise-management');
  };

  return (
    <div className="create-exercise-container">
      <div className="create-exercise-header">
        <h2 className="create-exercise-title">Create New Exercise</h2>
        <button 
          onClick={() => navigate('/exercise-management')}
          className="back-button"
        >
          Back to Management
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-exercise-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label className="form-label">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter exercise title"
              className="form-input"
            />
          </div>

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
          <h3>Tags</h3>
          <div className="tags-container">
            {['Pitch', 'Intonation', 'Rhythm'].map(tag => (
              <label 
                key={tag} 
                className={`tag-item ${tags.includes(tag) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  style={{ display: 'none' }}
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
            <label className="form-label">MusicXML Score (.musicxml):</label>
            <input
              type="file"
              accept=".musicxml,.xml"
              className="form-input file-input"
            />
          </div>

          <div className="form-group file-upload-group">
            <label className="form-label">Audio File (.mp3):</label>
            <input
              type="file"
              accept=".mp3,.wav,.m4a"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="form-input file-input"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            variant="secondary"
            onClick={() => navigate('/exercise-management')}
            className="btn-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="btn-create"
          >
            Create Exercise
          </Button>
        </div>
      </form>
    </div>
  );
}
