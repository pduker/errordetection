import React from 'react';

interface ExerciseSuccessModalProps {
  show: boolean;
  onOk: () => void;
  message: string;
}

export function ExerciseSuccessModal({ show, onOk, message }: ExerciseSuccessModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Success</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onOk} className="modal-btn btn-primary">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
