import React, { useState, useRef, useEffect } from "react";
import abcjs from "abcjs";

interface ScorePreviewProps {
  abcNotation: string;
  selectedNotes: {note: string, measure: string}[];
  onSelectionChange: (notes: {note: string, measure: string}[]) => void;
  onNoteClick: (note: string, measure: string) => void;
}

export function ScorePreview({ 
  abcNotation, 
  selectedNotes, 
  onSelectionChange, 
  onNoteClick 
}: ScorePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, endX: number, endY: number} | null>(null);

  // Selection box handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      const rect = e.currentTarget.getBoundingClientRect();
      setIsSelecting(true);
      setSelectionBox({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionBox) {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelectionBox({
        ...selectionBox,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      
      // Find notes within the selection box
      if (selectionBox) {
        const notesInSelection = findNotesInSelectionBox(selectionBox);
        if (notesInSelection.length > 0) {
          onSelectionChange(notesInSelection);
          // Highlight the selected notes after a short delay to ensure DOM is ready
          setTimeout(() => highlightSelectedNotes(), 100);
        }
      }
      
      // Clear the visual selection box
      setSelectionBox(null);
    }
  };

  // Function to find notes within the selection box
  const findNotesInSelectionBox = (box: {startX: number, startY: number, endX: number, endY: number}) => {
    const scoreElement = previewRef.current;
    if (!scoreElement) return [];
    
    // Get all note elements in the score
    const noteElements = scoreElement.querySelectorAll('.abcjs-note, .note, [class*="note"]');
    const selectedNotes: {note: string, measure: string}[] = [];
    
    const minX = Math.min(box.startX, box.endX);
    const maxX = Math.max(box.startX, box.endX);
    const minY = Math.min(box.startY, box.endY);
    const maxY = Math.max(box.startY, box.endY);
    
    noteElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const containerRect = scoreElement.getBoundingClientRect();
      
      // Calculate position relative to the score container
      const elementX = rect.left - containerRect.left + rect.width / 2;
      const elementY = rect.top - containerRect.top + rect.height / 2;
      
      // Check if the note is within the selection box
      if (elementX >= minX && elementX <= maxX && elementY >= minY && elementY <= maxY) {
        // Extract note information - this is a simplified approach
        const noteText = element.textContent || element.getAttribute('data-note') || 'Unknown';
        const measureElement = element.closest('[class*="measure"], .measure, [data-measure]');
        const measureNumber = measureElement ? 
          (measureElement.getAttribute('data-measure') || 
           measureElement.textContent?.match(/\d+/)?.[0] || '1') : '1';
        
        selectedNotes.push({
          note: noteText.trim(),
          measure: measureNumber
        });
      }
    });
    
    return selectedNotes;
  };

  // Function to highlight selected notes
  const highlightSelectedNotes = () => {
    const scoreElement = previewRef.current;
    if (!scoreElement) return;
    
    // Remove existing highlighting
    removeNoteHighlighting();
    
    // Add highlighting to selected notes
    const noteElements = scoreElement.querySelectorAll('.abcjs-note, .note, [class*="note"]');
    noteElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const containerRect = scoreElement.getBoundingClientRect();
      const elementX = rect.left - containerRect.left + rect.width / 2;
      const elementY = rect.top - containerRect.top + rect.height / 2;
      
      // Check if this note is in our selected notes
      const noteText = element.textContent || element.getAttribute('data-note') || '';
      const measureElement = element.closest('[class*="measure"], .measure, [data-measure]');
      const measureNumber = measureElement ? 
        (measureElement.getAttribute('data-measure') || 
         measureElement.textContent?.match(/\d+/)?.[0] || '1') : '1';
      
      const isSelected = selectedNotes.some(selectedNote => 
        selectedNote.note === noteText.trim() && selectedNote.measure === measureNumber
      );
      
      if (isSelected) {
        element.classList.add('selected-note');
        
        // Color the actual note elements
        const noteHead = element.querySelector('.abcjs-note-head, .notehead, [class*="notehead"], circle, ellipse');
        const noteStem = element.querySelector('.abcjs-note-stem, .stem, [class*="stem"], line');
        const notePath = element.querySelector('path, line, circle, ellipse');
        
        if (noteHead) {
          (noteHead as HTMLElement).style.fill = '#f97316';
          (noteHead as HTMLElement).style.stroke = '#c2410c';
        }
        
        if (noteStem) {
          (noteStem as HTMLElement).style.stroke = '#f97316';
        }
        
        // Fallback to color any path/shape elements
        if (notePath && !noteHead) {
          (notePath as HTMLElement).style.fill = '#f97316';
          (notePath as HTMLElement).style.stroke = '#c2410c';
        }
        
        // Add a subtle glow effect
        if (!element.querySelector('.selection-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'selection-indicator';
          indicator.style.cssText = `
            position: absolute;
            background: rgba(249, 115, 22, 0.1);
            border: 1px solid rgba(249, 115, 22, 0.3);
            border-radius: 4px;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            top: -2px;
            left: -2px;
            pointer-events: none;
            z-index: 999;
          `;
          (element as HTMLElement).style.position = 'relative';
          element.appendChild(indicator);
        }
      }
    });
  };

  // Function to remove highlighting from all notes
  const removeNoteHighlighting = () => {
    const scoreElement = previewRef.current;
    if (!scoreElement) return;
    
    // Remove the selected-note class
    const selectedNotes = scoreElement.querySelectorAll('.selected-note');
    selectedNotes.forEach(note => note.classList.remove('selected-note'));
    
    // Remove selection indicators
    const indicators = scoreElement.querySelectorAll('.selection-indicator');
    indicators.forEach(indicator => indicator.remove());
    
    // Restore original colors to note elements
    const noteElements = scoreElement.querySelectorAll('.abcjs-note, .note, [class*="note"]');
    noteElements.forEach((element) => {
      const noteHead = element.querySelector('.abcjs-note-head, .notehead, [class*="notehead"], circle, ellipse');
      const noteStem = element.querySelector('.abcjs-note-stem, .stem, [class*="stem"], line');
      const notePath = element.querySelector('path, line, circle, ellipse');
      
      if (noteHead) {
        (noteHead as HTMLElement).style.fill = '';
        (noteHead as HTMLElement).style.stroke = '';
      }
      
      if (noteStem) {
        (noteStem as HTMLElement).style.stroke = '';
      }
      
      // Fallback to clear any path/shape elements
      if (notePath && !noteHead) {
        (notePath as HTMLElement).style.fill = '';
        (notePath as HTMLElement).style.stroke = '';
      }
    });
  };

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
          },
          clickListener: function(abcelem, tuneNumber, classes, analysis, drag) {
            // Handle note clicks for feedback targeting
            if (abcelem && abcelem.abselem && abcelem.abselem.elemset && abcelem.abselem.elemset.length > 0) {
              const noteElems = abcelem.abselem.elemset[0];
              const staffPos = Number(noteElems.getAttribute("staffPos")) + 1;
              const measurePos = Number(noteElems.getAttribute("measurePos")) + 1;
              const noteName = abcelem.pitches && abcelem.pitches.length > 0 
                ? (typeof abcelem.pitches[0] === 'string' ? abcelem.pitches[0] : abcelem.pitches[0].name || 'note')
                : 'note';
              
              onNoteClick(noteName, measurePos.toString());
              
              // Visual feedback - highlight selected note
              const svgElement = previewRef.current?.querySelector("svg");
              if (svgElement) {
                // Clear previous selections
                svgElement.querySelectorAll('.selected-for-feedback').forEach(el => {
                  el.classList.remove('selected-for-feedback');
                });
                
                // Highlight new selection
                if (noteElems) {
                  noteElems.classList.add('selected-for-feedback');
                }
              }
            }
          },
          selectTypes: ["note"]
        });
        
        // Re-apply selected notes highlighting after rendering
        if (selectedNotes.length > 0) {
          setTimeout(() => highlightSelectedNotes(), 100);
        }
      } catch (error) {
        console.error('Error rendering ABC notation:', error);
      }
    }
  }, [abcNotation, selectedNotes]);

  useEffect(() => {
    // Apply highlighting when selectedNotes changes
    if (selectedNotes.length > 0) {
      setTimeout(() => highlightSelectedNotes(), 100);
    }
  }, [selectedNotes]);

  useEffect(() => {
    // Clean up highlighting when component unmounts
    return () => {
      removeNoteHighlighting();
    };
  }, []);

  return (
    <div className="score-preview-section">
      <div className="preview-header">
        <h4>Score Preview</h4>
      </div>
      <div className="score-preview-container">
        <div 
          className={`score-preview-content ${isSelecting ? 'selecting' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
          
          {/* Selection Box Overlay */}
          {selectionBox && (
            <div
              className="selection-box"
              style={{
                position: 'absolute',
                border: '2px dashed #f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                pointerEvents: 'none',
                left: Math.min(selectionBox.startX, selectionBox.endX),
                top: Math.min(selectionBox.startY, selectionBox.endY),
                width: Math.abs(selectionBox.endX - selectionBox.startX),
                height: Math.abs(selectionBox.endY - selectionBox.startY),
                zIndex: 1000
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
