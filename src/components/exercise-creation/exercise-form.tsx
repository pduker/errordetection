import React, { useState } from "react";
import ExerciseData from "../../interfaces/exerciseData";

interface ExerciseFormProps {
  difficulty: number;
  setDifficulty: (value: number) => void;
  voices: number;
  setVoices: (value: number) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  types: string;
  setTypes: (value: string) => void;
  meter: string;
  setMeter: (value: string) => void;
  transpos: boolean;
  setTranspos: (value: boolean) => void;
  customId: string;
  setCustomId: (value: string) => void;
  fieldErrors: {
    tags: boolean;
    musicXml: boolean;
    audio: boolean;
    customId: boolean;
  };
}

export function ExerciseForm({
  difficulty,
  setDifficulty,
  voices,
  setVoices,
  tags,
  setTags,
  types,
  setTypes,
  meter,
  setMeter,
  transpos,
  setTranspos,
  customId,
  setCustomId,
  fieldErrors
}: ExerciseFormProps) {
  return (
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
                className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                onClick={() => setDifficulty(level)}
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
                className={`voice-btn ${voices === voice ? 'active' : ''}`}
                onClick={() => setVoices(voice)}
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
  );
}
