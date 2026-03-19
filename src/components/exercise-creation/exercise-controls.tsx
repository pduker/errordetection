import React from "react";

interface ExerciseControlsProps {
  onCreateExercise: () => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function ExerciseControls({ onCreateExercise, onCancel, isEdit = false }: ExerciseControlsProps) {
  return (
    <div className="exercise-controls">
      <div className="controls-left">
        <div className="exercise-type-indicator">
          <h2 className="exercise-title">{isEdit ? "Edit Exercise" : "New Exercise"}</h2>
        </div>
      </div>
      
      <div className="controls-right">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="control-btn cancel-btn"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onCreateExercise}
          className="control-btn create-btn"
        >
          {isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}
