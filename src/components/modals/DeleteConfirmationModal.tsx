import React from 'react';

interface DeleteConfirmationModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  exerciseCount: number;
}

export function DeleteConfirmationModal({ show, onConfirm, onCancel, exerciseCount }: DeleteConfirmationModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirm Delete</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete {exerciseCount} selected exercise{exerciseCount !== 1 ? 's' : ''}?</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="modal-btn modal-btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn modal-btn-confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
