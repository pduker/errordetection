// Progressive hint system
// Provides increasingly specific feedback based on attempt count and accuracy

interface HintLevel {
  level: number;
  name: string;
  hintType: 'general' | 'directional' | 'specific' | 'answer';
  getHint: (
    selections: any[], 
    correctAnswers: any[], 
    attemptCount: number
  ) => {
    message: string;
    highlightTargets?: any[];
    revealCount?: number;
  };
}

const progressiveHints: HintLevel[] = [
  {
    level: 1,
    name: 'General Guidance',
    hintType: 'general',
    getHint: (selections, correct, attempts) => ({
      message: `Look for ${correct.length} note(s) that contain the error pattern. Focus on the rhythm and pitch relationships.`,
      highlightTargets: [],
      revealCount: 0
    })
  },
  {
    level: 2,
    name: 'Measure Guidance',
    hintType: 'directional',
    getHint: (selections, correct, attempts) => {
      const correctMeasures = [...new Set(correct.map(c => c.measurePos))];
      const selectedMeasures = [...new Set(selections.map(s => s.measurePos))];
      const missedMeasures = correctMeasures.filter(m => !selectedMeasures.includes(m));
      
      return {
        message: missedMeasures.length > 0 
          ? `Check measure(s) ${missedMeasures.map(m => m + 1).join(', ')} more carefully.`
          : `You're looking in the right measures, but check specific notes.`,
        highlightTargets: [],
        revealCount: 0
      };
    }
  },
  {
    level: 3,
    name: 'Staff Guidance',
    hintType: 'directional',
    getHint: (selections, correct, attempts) => {
      const correctStaffs = [...new Set(correct.map(c => c.staffPos))];
      const selectedStaffs = [...new Set(selections.map(s => s.staffPos))];
      const missedStaffs = correctStaffs.filter(s => !selectedStaffs.includes(s));
      
      return {
        message: missedStaffs.length > 0
          ? `Check the ${missedStaffs.includes(0) ? 'treble' : 'bass'} staff.`
          : `You're on the right staff, but check which specific notes.`,
        highlightTargets: [],
        revealCount: 0
      };
    }
  },
  {
    level: 4,
    name: 'Partial Reveal',
    hintType: 'specific',
    getHint: (selections, correct, attempts) => {
      const incorrectSelections = selections.filter(s => 
        !correct.some(c => c.measurePos === s.measurePos && c.index === s.index)
      );
      const missedCorrect = correct.filter(c => 
        !selections.some(s => c.measurePos === s.measurePos && c.index === s.index)
      );
      
      // Reveal 1 correct note as a hint
      const revealCount = Math.min(1, missedCorrect.length);
      const toReveal = missedCorrect.slice(0, revealCount);
      
      return {
        message: `Here's a hint: ${revealCount} correct note(s) highlighted. Remove your incorrect selections first.`,
        highlightTargets: toReveal,
        revealCount
      };
    }
  },
  {
    level: 5,
    name: 'Full Answer',
    hintType: 'answer',
    getHint: (selections, correct, attempts) => ({
      message: 'Here are all the correct notes. Study them and try again!',
      highlightTargets: correct,
      revealCount: correct.length
    })
  }
];

const ProgressiveHintSystem = ({
  studentSelections,
  correctAnswers,
  attemptCount,
  onHintUsed
}: {
  studentSelections: any[];
  correctAnswers: any[];
  attemptCount: number;
  onHintUsed: (hintLevel: number) => void;
}) => {
  const [currentHintLevel, setCurrentHintLevel] = useState(1);
  const [showHint, setShowHint] = useState(false);
  
  // Determine appropriate hint level based on performance
  const getAppropriateHintLevel = () => {
    const accuracy = studentSelections.length > 0 
      ? studentSelections.filter(s => 
          correctAnswers.some(c => c.measurePos === s.measurePos && c.index === s.index)
        ).length / studentSelections.length
      : 0;
    
    // If accuracy is very low or they've tried many times, offer more specific hints
    if (attemptCount >= 5 || accuracy <= 0.2) return Math.min(4, currentHintLevel);
    if (attemptCount >= 3 || accuracy <= 0.5) return Math.min(3, currentHintLevel);
    if (attemptCount >= 2) return Math.min(2, currentHintLevel);
    return 1;
  };
  
  const getHint = () => {
    const level = getAppropriateHintLevel();
    const hint = progressiveHints[level - 1];
    setShowHint(true);
    onHintUsed(level);
    
    // Apply highlighting if hint has targets
    if (hint.hintType === 'specific' || hint.hintType === 'answer') {
      const hintData = hint.getHint(studentSelections, correctAnswers, attemptCount);
      highlightHintTargets(hintData.highlightTargets);
    }
    
    return hint.getHint(studentSelections, correctAnswers, attemptCount);
  };
  
  const highlightHintTargets = (targets: any[]) => {
    targets.forEach(target => {
      // Find and highlight the target notes with a special hint color
      const elements = document.querySelectorAll(
        `[measurePos="${target.measurePos}"][index="${target.index}"]`
      );
      elements.forEach(el => {
        el.setAttribute('fill', '#ffeb3b'); // Yellow for hints
        el.setAttribute('stroke', '#f57c00'); // Orange border
      });
    });
  };
  
  const hint = showHint 
    ? progressiveHints[currentHintLevel - 1].getHint(studentSelections, correctAnswers, attemptCount)
    : null;
  
  return (
    <div className="progressive-hint-system">
      <div className="hint-controls">
        <button 
          onClick={getHint}
          disabled={currentHintLevel > progressiveHints.length}
          className="hint-button"
        >
          Get Hint (Level {currentHintLevel})
        </button>
        {showHint && (
          <button 
            onClick={() => setShowHint(false)}
            className="hide-hint-button"
          >
            Hide Hint
          </button>
        )}
      </div>
      
      {showHint && hint && (
        <div className="hint-display">
          <div className="hint-header">
            <h4>{progressiveHints[currentHintLevel - 1].name}</h4>
          </div>
          <div className="hint-content">
            <p>{hint.message}</p>
            {hint.revealCount > 0 && (
              <p className="reveal-count">
                {hint.revealCount} note(s) highlighted in yellow
              </p>
            )}
          </div>
          {currentHintLevel < progressiveHints.length && (
            <button 
              onClick={() => setCurrentHintLevel(currentHintLevel + 1)}
              className="next-hint-button"
            >
              Need More Specific Hint?
            </button>
          )}
        </div>
      )}
    </div>
  );
};
