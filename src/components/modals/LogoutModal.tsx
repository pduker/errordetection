import React from 'react';

interface LogoutModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ show, onConfirm, onCancel }: LogoutModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="modal-btn modal-btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn modal-btn-confirm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
