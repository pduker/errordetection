// Pattern-based feedback system
// This analyzes the student's selection patterns and provides contextual feedback

interface FeedbackPattern {
  id: string;
  name: string;
  condition: (selections: any[], correctAnswers: any[]) => boolean;
  message: string;
  suggestion: string;
  priority: number;
}

const feedbackPatterns: FeedbackPattern[] = [
  {
    id: 'all_correct',
    name: 'Perfect Score',
    condition: (selections, correct) => {
      return selections.length === correct.length && 
             selections.every(s => correct.some(c => 
               c.measurePos === s.measurePos && c.index === s.index
             ));
    },
    message: 'Perfect! You found all the correct notes.',
    suggestion: 'Great work! Try a more challenging exercise.',
    priority: 1
  },
  {
    id: 'missing_correct',
    name: 'Missing Correct Notes',
    condition: (selections, correct) => {
      const missingCount = correct.filter(c => 
        !selections.some(s => c.measurePos === s.measurePos && c.index === s.index)
      ).length;
      return missingCount > 0 && missingCount <= 2;
    },
    message: `You're close! You missed ${missingCount} correct note(s).`,
    suggestion: 'Look for notes that match the pattern you\'re studying.',
    priority: 2
  },
  {
    id: 'too_many_selections',
    name: 'Too Many Selections',
    condition: (selections, correct) => {
      return selections.length > correct.length + 2;
    },
    message: 'You selected more notes than needed.',
    suggestion: 'Try to be more precise. Focus on the specific error pattern.',
    priority: 3
  },
  {
    id: 'rhythm_pattern_error',
    name: 'Rhythm Pattern Mistake',
    condition: (selections, correct) => {
      // Check if student is selecting on wrong beats
      const selectedBeats = selections.map(s => s.beatIndex || 0);
      const correctBeats = correct.map(c => c.beatIndex || 0);
      const commonBeats = selectedBeats.filter(beat => correctBeats.includes(beat));
      return commonBeats.length < selectedBeats.length * 0.5;
    },
    message: 'Check your rhythm. You might be selecting on the wrong beats.',
    suggestion: 'Tap the rhythm first, then identify the notes.',
    priority: 2
  },
  {
    id: 'wrong_staff',
    name: 'Wrong Staff Selection',
    condition: (selections, correct) => {
      // Check if consistently selecting from wrong staff
      if (selections.length < 3) return false;
      const selectedStaffs = selections.map(s => s.staffPos);
      const correctStaffs = correct.map(c => c.staffPos);
      const selectedStaffSet = [...new Set(selectedStaffs)];
      const correctStaffSet = [...new Set(correctStaffs)];
      return selectedStaffSet.some(staff => !correctStaffSet.includes(staff));
    },
    message: 'Check which staff you\'re selecting from.',
    suggestion: 'Make sure you\'re looking at the correct staff (treble/bass).',
    priority: 3
  }
];

const analyzePatternFeedback = (
  studentSelections: any[], 
  correctAnswers: any[]
): FeedbackPattern | null => {
  // Sort patterns by priority (lower number = higher priority)
  const sortedPatterns = feedbackPatterns.sort((a, b) => a.priority - b.priority);
  
  for (const pattern of sortedPatterns) {
    if (pattern.condition(studentSelections, correctAnswers)) {
      return pattern;
    }
  }
  
  return null;
};

// Enhanced feedback display component
const PatternFeedbackDisplay = ({ 
  selections, 
  correctAnswers, 
  onPatternFeedback 
}: {
  selections: any[];
  correctAnswers: any[];
  onPatternFeedback: (pattern: FeedbackPattern) => void;
}) => {
  const pattern = analyzePatternFeedback(selections, correctAnswers);
  
  if (!pattern) return null;
  
  return (
    <div className="pattern-feedback">
      <div className="feedback-header">
        <h4>{pattern.name}</h4>
      </div>
      <div className="feedback-content">
        <p className="feedback-message">{pattern.message}</p>
        <p className="feedback-suggestion">{pattern.suggestion}</p>
      </div>
      <div className="feedback-actions">
        <button onClick={() => onPatternFeedback(pattern)}>
          Get Hint
        </button>
        <button onClick={() => {/* Try Again logic */}}>
          Try Again
        </button>
      </div>
    </div>
  );
};
