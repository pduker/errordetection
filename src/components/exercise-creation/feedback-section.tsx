import React from "react";

interface FeedbackItem {
  id: string;
  text: string;
  targetNote?: string;
  targetMeasure?: string;
}

interface FeedbackSectionProps {
  feedbackItems: FeedbackItem[];
  setFeedbackItems: (items: FeedbackItem[]) => void;
  selectedNote: {note: string, measure: string} | null;
  selectedNotes: {note: string, measure: string}[];
  onClearSelection: () => void;
}

export function FeedbackSection({ 
  feedbackItems, 
  setFeedbackItems, 
  selectedNote, 
  selectedNotes, 
  onClearSelection 
}: FeedbackSectionProps) {
  const addFeedbackItem = () => {
    const newId = Date.now().toString();
    const newItem = { 
      id: newId, 
      text: "",
      targetNote: selectedNote?.note,
      targetMeasure: selectedNote?.measure
    };
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
      <h4>Wrong Answer Feedback</h4>
      <div className="feedback-instructions">
        <p>Click and drag to select multiple notes, or click individual notes to target specific feedback, or add general feedback.</p>
      </div>
      <div className="feedback-controls">
        {(selectedNote || selectedNotes.length > 0) && (
          <div className="selected-note-info">
            <span className="selected-note-label">
              Selected: {selectedNotes.length > 0 ? `${selectedNotes.length} notes` : `${selectedNote?.note} in measure ${selectedNote?.measure}`}
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="clear-selection-btn"
            >
              Clear All
            </button>
          </div>
        )}
        {feedbackItems.length === 0 ? (
          <div className="feedback-empty">
            <p>No feedback items added. Add feedback for specific notes or general mistakes.</p>
            <button
              type="button"
              onClick={addFeedbackItem}
              className="add-feedback-btn"
              disabled={!selectedNote && selectedNotes.length === 0}
            >
              {selectedNotes.length > 0 ? `+ Add Feedback for ${selectedNotes.length} Notes` : selectedNote ? "+ Add Feedback for Selected Note" : "+ Add General Feedback"}
            </button>
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
                <textarea
                  value={item.text}
                  onChange={(e) => updateFeedbackItem(item.id, e.target.value)}
                  placeholder={item.targetNote 
                    ? `Feedback for ${item.targetNote} in measure ${item.targetMeasure}...`
                    : "Enter general feedback message..."
                  }
                  className="feedback-textarea"
                  rows={2}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addFeedbackItem}
              className="add-feedback-btn"
            >
              {selectedNotes.length > 0 ? `+ Add Feedback for ${selectedNotes.length} Notes` : selectedNote ? "+ Add Feedback for Selected Note" : "+ Add General Feedback"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
