import React from "react";
import { FeedbackType, MarkedNote, createFeedbackItem } from "../../types/feedback-types";

interface FeedbackItem {
  id: string;
  text: string;
  targetNote?: string;
  targetMeasure?: string;
}

interface FeedbackSectionProps {
  feedbackItems: {id: string, type: FeedbackType, text: string, targetNote?: string, targetMeasure?: string}[];
  setFeedbackItems: (items: {id: string, type: FeedbackType, text: string, targetNote?: string, targetMeasure?: string}[]) => void;
  selectedNote: {note: string, measure: string} | null;
  selectedNotes: {note: string, measure: string}[];
  rhythmCorrect: MarkedNote[];
  pitchCorrect: MarkedNote[];
  onMarkAsRhythmCorrect: () => void;
  onMarkAsPitchCorrect: () => void;
  onRemoveFromRhythm: (note: {note: string, measure: string}) => void;
  onRemoveFromPitch: (note: {note: string, measure: string}) => void;
  onClearSelection: () => void;
  onClearAllNotes: () => void;
}

export function FeedbackSection({ 
  feedbackItems, 
  setFeedbackItems, 
  selectedNote, 
  selectedNotes,
  rhythmCorrect,
  pitchCorrect,
  onMarkAsRhythmCorrect,
  onMarkAsPitchCorrect,
  onRemoveFromRhythm,
  onRemoveFromPitch,
  onClearSelection,
  onClearAllNotes
}: FeedbackSectionProps) {
  const addFeedbackItem = (type: FeedbackType = 'note') => {
    const newItem = createFeedbackItem(type, "", selectedNote ? {
      note: selectedNote.note,
      measure: selectedNote.measure
    } : undefined);
    setFeedbackItems([...feedbackItems, newItem]);
  };

  const updateFeedbackItem = (id: string, text: string) => {
    setFeedbackItems(feedbackItems.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const removeFeedbackItem = (id: string) => {
    setFeedbackItems(feedbackItems.filter(item => item.id !== id));
  };

  const updateFeedbackTarget = (id: string) => {
    // This would open a note selection interface
    console.log("Update feedback target for item:", id);
  };

  return (
    <div className="feedback-section">
      <h4>Score Feedback</h4>
      <div className="feedback-instructions">
        <p>Select notes and mark them for rhythm correctness (green) or pitch correctness (blue). Add specific feedback notes for targeted guidance.</p>
      </div>
      
      {/* Note Selection Controls */}
      <div className="note-selection-controls">
        {(selectedNote || selectedNotes.length > 0) && (
          <div className="selected-note-info">
            <span className="selected-note-label">
              Selected: {selectedNotes.length > 0 ? `${selectedNotes.length} notes` : `${selectedNote?.note} in measure ${selectedNote?.measure}`}
            </span>
            <div className="selection-actions">
              <button
                type="button"
                onClick={onMarkAsRhythmCorrect}
                className="mark-rhythm-correct-btn"
                title="Mark selected notes as rhythm correct"
                style={{ backgroundColor: '#4CAF50', color: 'white', marginRight: '8px' }}
              >
                ♩ Rhythm Correct
              </button>
              <button
                type="button"
                onClick={onMarkAsPitchCorrect}
                className="mark-pitch-correct-btn"
                title="Mark selected notes as pitch correct"
                style={{ backgroundColor: '#2196F3', color: 'white', marginRight: '8px' }}
              >
                ♫ Pitch Correct
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="clear-selection-btn"
                title="Clear selection"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        {/* Clear All button - always visible when there are notes to clear */}
        {(selectedNote || selectedNotes.length > 0 || rhythmCorrect.length > 0 || pitchCorrect.length > 0) && (
          <div className="clear-all-container">
            <button
              type="button"
              onClick={onClearAllNotes}
              className="clear-all-btn"
              title="Clear all notes (selection, correct, and wrong)"
            >
              Clear All Notes
            </button>
          </div>
        )}
      </div>

      {/* Rhythm and Pitch Correct Notes Display */}
      <div className="marked-notes-section">
        <div className="rhythm-correct-column">
          <h5 style={{ color: '#4CAF50' }}>Rhythm Correct ({rhythmCorrect.length})</h5>
          <div className="notes-list">
            {rhythmCorrect.length === 0 ? (
              <p className="empty-notes">No rhythm correct notes marked</p>
            ) : (
              rhythmCorrect.map((note, index) => (
                <div key={`rhythm-${index}`} className="note-item rhythm-correct-note">
                  <span className="note-info">{note.note} (measure {note.measure})</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFromRhythm(note)}
                    className="remove-note-btn"
                    title="Remove from rhythm correct"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pitch-correct-column">
          <h5 style={{ color: '#2196F3' }}>Pitch Correct ({pitchCorrect.length})</h5>
          <div className="notes-list">
            {pitchCorrect.length === 0 ? (
              <p className="empty-notes">No pitch correct notes marked</p>
            ) : (
              pitchCorrect.map((note, index) => (
                <div key={`pitch-${index}`} className="note-item pitch-correct-note">
                  <span className="note-info">{note.note} (measure {note.measure})</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFromPitch(note)}
                    className="remove-note-btn"
                    title="Remove from pitch correct"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feedback Items Section */}
      <div className="feedback-items-section">
        <h5>Feedback Notes</h5>
        <div className="feedback-instructions">
          <p>Add specific feedback messages for rhythm, pitch, or general guidance.</p>
        </div>
        
        <div className="feedback-controls">
          {feedbackItems.length === 0 ? (
            <div className="feedback-empty">
              <p>No feedback messages added.</p>
              <div className="feedback-type-buttons">
                <button
                  type="button"
                  onClick={() => addFeedbackItem('rhythm')}
                  className="add-feedback-btn"
                  style={{ backgroundColor: '#4CAF50', color: 'white', marginRight: '8px' }}
                >
                  + Add Rhythm Feedback
                </button>
                <button
                  type="button"
                  onClick={() => addFeedbackItem('pitch')}
                  className="add-feedback-btn"
                  style={{ backgroundColor: '#2196F3', color: 'white', marginRight: '8px' }}
                >
                  + Add Pitch Feedback
                </button>
                <button
                  type="button"
                  onClick={() => addFeedbackItem('note')}
                  className="add-feedback-btn"
                >
                  + Add General Feedback
                </button>
              </div>
            </div>
          ) : (
            <div className="feedback-list">
              {feedbackItems.map((item, index) => (
                <div key={item.id} className="feedback-item">
                  <div className="feedback-item-header">
                    <label>Feedback {index + 1}:</label>
                    <button
                      type="button"
                      onClick={() => removeFeedbackItem(item.id)}
                      className="remove-feedback-btn"
                      title="Remove feedback"
                    >
                      ✕
                    </button>
                  </div>
                  {item.targetNote && (
                    <div className="feedback-target-info">
                      <span className="target-label">Target:</span>
                      <span className="target-detail">
                        {item.targetNote} in measure {item.targetMeasure}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateFeedbackTarget(item.id)}
                        className="retarget-btn"
                        title="Change target"
                      >
                        🎯
                      </button>
                    </div>
                  )}
                  <div className="feedback-type-badge">
                    <span className={`type-badge type-${item.type}`}>
                      {item.type === 'rhythm' ? '♩ Rhythm' : item.type === 'pitch' ? '♫ Pitch' : '📝 General'}
                    </span>
                  </div>
                  <textarea
                    value={item.text}
                    onChange={(e) => updateFeedbackItem(item.id, e.target.value)}
                    placeholder={item.targetNote 
                      ? `Feedback for ${item.targetNote} in measure ${item.targetMeasure}...`
                      : `Enter ${item.type} feedback message...`
                    }
                    className="feedback-textarea"
                    rows={2}
                  />
                </div>
              ))}
              <div className="feedback-type-buttons">
                <button
                  type="button"
                  onClick={() => addFeedbackItem('rhythm')}
                  className="add-feedback-btn"
                  style={{ backgroundColor: '#4CAF50', color: 'white', marginRight: '8px' }}
                >
                  + Add Rhythm Feedback
                </button>
                <button
                  type="button"
                  onClick={() => addFeedbackItem('pitch')}
                  className="add-feedback-btn"
                  style={{ backgroundColor: '#2196F3', color: 'white', marginRight: '8px' }}
                >
                  + Add Pitch Feedback
                </button>
                <button
                  type="button"
                  onClick={() => addFeedbackItem('note')}
                  className="add-feedback-btn"
                >
                  + Add General Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
