import React, { useRef, useEffect } from "react";
import abcjs from "abcjs";

interface ScorePreviewProps {
  abcNotation: string;
  selectedNotes: {note: string, measure: string}[];
  rhythmCorrect: [];
  pitchCorrect: [];
  feedbackNotes: [];
  onSelectionChange: (notes: {note: string, measure: string}[]) => void;
  onNoteClick: (note: string, measure: string) => void;
  resetSelection: boolean;
  resetCounter?: number;
}

export function ScorePreview({ 
  abcNotation, 
  selectedNotes, 
  rhythmCorrect,
  pitchCorrect,
  feedbackNotes,
  onSelectionChange, 
  onNoteClick,
  resetSelection,
  resetCounter
}: ScorePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abcNotation && previewRef.current) {
      try {
        abcjs.renderAbc(previewRef.current, abcNotation, {
          responsive: "resize",
          lineThickness: 0.4,
          add_classes: true,
          staffwidth: 800,
          wrap: {
            minSpacing: 1.0,
            maxSpacing: 2.5,
            preferredMeasuresPerLine: 4
          }
        });
      } catch (error) {
        console.error('Error rendering ABC notation:', error);
      }
    }
  }, [abcNotation]);

  return (
    <div className="score-preview-section">
      <div className="score-preview-container">
        <div 
          className="score-preview-content"
          style={{ position: 'relative', userSelect: 'none' }}
        >
          {abcNotation ? (
            <div 
              ref={previewRef}
              className="abc-score-display"
            />
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              Drop a MusicXML file above to see the score preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
