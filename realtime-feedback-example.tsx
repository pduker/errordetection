// Real-time feedback approach for score-preview.tsx
// This would replace the current highlight function

const highlightWithRealtimeFeedback = function (note: any, klass: any, clicked: boolean): number {
  if (!note || !note.abselem || !note.abselem.elemset || note.abselem.elemset.length === 0) {
    return 0;
  }
  
  var retval = 0;
  var noteElems = note.abselem.elemset[0];
  var selTim = Number(noteElems.getAttribute("selectedTimes")) || 0;
  if (clicked) selTim++;
  
  if (selTim === 3) {
    selTim = 0;
    retval = 1;
  } else if (selTim > 3) {
    selTim %= 3;
  }
  
  // Get note info
  const noteInfo = {
    note: note.pitches && note.pitches.length > 0 
      ? (typeof note.pitches[0] === 'string' ? note.pitches[0] : note.pitches[0].name || 'note')
      : 'note',
    measure: (Number(noteElems.getAttribute("measurePos")) + 1).toString()
  };
  
  // REAL-TIME FEEDBACK: Check against correct answers immediately
  const isCorrect = correctNotes.some(n => n.note === noteInfo.note && n.measure === noteInfo.measure);
  const isWrong = wrongNotes.some(n => n.note === noteInfo.note && n.measure === noteInfo.measure);
  
  let color = "#000000";
  let feedbackText = "";
  
  if (isCorrect) {
    color = "#00aa00"; // green for correct
    feedbackText = "✓ Correct!";
  } else if (isWrong) {
    color = "#ff0000"; // red for wrong
    feedbackText = "✗ Try again";
  } else if (selTim === 1) {
    color = "#ff6100"; // orange - neutral selection
    feedbackText = "Selected";
  } else if (selTim === 2) {
    color = "#648fff"; // blue - alternative selection
    feedbackText = "Selected";
  }
  
  if (clicked) {
    noteElems.setAttribute("selectedTimes", selTim.toString());
    
    // Show immediate feedback toast/popup
    if (isCorrect || isWrong) {
      showFeedbackToast(feedbackText, noteInfo);
    }
  }
  
  setClass(note.abselem.elemset, klass, "", color);
  return retval;
};

// Helper function to show feedback toast
const showFeedbackToast = (message: string, noteInfo: {note: string, measure: string}) => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'feedback-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: absolute;
    background: ${message.includes('✓') ? '#00aa00' : '#ff0000'};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
  `;
  
  // Position near the note (this would need more sophisticated positioning)
  document.body.appendChild(toast);
  
  // Remove after 2 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 2000);
};
