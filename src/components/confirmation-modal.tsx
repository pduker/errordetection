import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  hideCancelButton?: boolean;
}

export function ConfirmationModal({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  hideCancelButton = false
}: ConfirmationModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        {!hideCancelButton && (
          <Button variant="secondary" onClick={onHide}>
            {cancelText}
          </Button>
        )}
        {hideCancelButton ? (
          <div style={{ marginLeft: 'auto' }}>
            <Button 
              variant="primary" 
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        ) : (
          <Button 
            variant="primary" 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
