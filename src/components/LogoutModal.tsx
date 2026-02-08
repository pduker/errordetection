import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/database';

interface LogoutModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  setAuthorized: (authorized: boolean) => void;
  navigateTo?: string; // Optional navigation target
}

export function LogoutModal({ show, onConfirm, onCancel, setAuthorized, navigateTo = "/help" }: LogoutModalProps) {
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await signOut(auth);
      setAuthorized(false);
      localStorage.removeItem('adminAuthorized');
      console.log("Logged out successfully");
      onConfirm();
      // Navigate to the specified page after logout
      navigate(navigateTo);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to logout of admin mode?</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="modal-btn modal-btn-cancel">
            Cancel
          </button>
          <button onClick={handleConfirm} className="modal-btn modal-btn-confirm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
