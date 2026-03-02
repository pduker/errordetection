import React from "react";
import { Modal, Button } from "react-bootstrap";

interface PreviewModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  difficulty: number;
  voices: number;
  meter: string;
  tags: string[];
  types: string;
  customId: string;
  transpos: boolean;
  musicXmlFile: File | null;
  audioFile: File | null;
  exerciseCount: number;
}

export function PreviewModal({
  show,
  onHide,
  title,
  difficulty,
  voices,
  meter,
  tags,
  types,
  customId,
  transpos,
  musicXmlFile,
  audioFile,
  exerciseCount
}: PreviewModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      size="lg"
      className="preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="exercise-preview-content">
          <div className="preview-section">
            <h4>Exercise Details</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Title:</span>
                <span className="preview-value">Exercise {exerciseCount + 1}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Difficulty:</span>
                <span className="preview-value">{difficulty}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Voices:</span>
                <span className="preview-value">{voices}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Meter:</span>
                <span className="preview-value">{meter}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Types:</span>
                <span className="preview-value">{tags.join(', ')}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Textural Factors:</span>
                <span className="preview-value">{types}</span>
              </div>
              {customId && (
                <div className="preview-item">
                  <span className="preview-label">Custom ID:</span>
                  <span className="preview-value">{customId}</span>
                </div>
              )}
              {transpos && (
                <div className="preview-item">
                  <span className="preview-label">Transposing:</span>
                  <span className="preview-value">Yes</span>
                </div>
              )}
            </div>
          </div>
          <div className="preview-section">
            <h4>Files</h4>
            <div className="preview-files">
              <div className="preview-file">
                <span className="file-icon">🎼</span>
                <span className="file-name">{musicXmlFile?.name}</span>
              </div>
              <div className="preview-file">
                <span className="file-icon">💿</span>
                <span className="file-name">{audioFile?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
