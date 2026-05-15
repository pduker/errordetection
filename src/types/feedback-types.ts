// Enhanced feedback types for rhythm and pitch correctness
export type FeedbackType = 'rhythm' | 'pitch' | 'note';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  text: string;
  targetNote?: string;
  targetMeasure?: string;
  targetBeat?: number; // For rhythm-specific feedback
}

export interface MarkedNote {
  note: string;
  measure: string;
  rhythmCorrect?: boolean;
  pitchCorrect?: boolean;
  feedbackNote?: string;
}

export interface FeedbackState {
  rhythmCorrect: MarkedNote[];
  pitchCorrect: MarkedNote[];
  feedbackNotes: FeedbackItem[];
}

// Helper functions for feedback management
export const createFeedbackItem = (
  type: FeedbackType,
  text: string,
  target?: {note: string, measure: string, beat?: number}
): FeedbackItem => ({
  id: Date.now().toString(),
  type,
  text,
  targetNote: target?.note,
  targetMeasure: target?.measure,
  targetBeat: target?.beat
});

export const updateNoteMarking = (
  currentNotes: MarkedNote[],
  noteInfo: {note: string, measure: string},
  updates: Partial<MarkedNote>
): MarkedNote[] => {
  const existingIndex = currentNotes.findIndex(
    n => n.note === noteInfo.note && n.measure === noteInfo.measure
  );
  
  if (existingIndex >= 0) {
    const updated = [...currentNotes];
    updated[existingIndex] = { ...updated[existingIndex], ...updates };
    return updated;
  } else {
    return [...currentNotes, { note: noteInfo.note, measure: noteInfo.measure, ...updates }];
  }
};

export const removeNoteMarking = (
  currentNotes: MarkedNote[],
  noteInfo: {note: string, measure: string}
): MarkedNote[] => {
  return currentNotes.filter(
    n => !(n.note === noteInfo.note && n.measure === noteInfo.measure)
  );
};

// Color scheme for different feedback types
export const FEEDBACK_COLORS = {
  rhythmCorrect: '#4CAF50',    // Green
  rhythmIncorrect: '#F44336',  // Red
  pitchCorrect: '#2196F3',     // Blue
  pitchIncorrect: '#FF9800',   // Orange
  feedbackNote: '#9C27B0',      // Purple
  selected: '#FF6100',         // Orange (existing)
  neutral: '#000000'           // Black
} as const;

// Helper to get color based on note markings
export const getNoteColor = (
  noteInfo: {note: string, measure: string},
  rhythmCorrect: MarkedNote[],
  pitchCorrect: MarkedNote[],
  selectedTimes: number
): string => {
  const rhythmNote = rhythmCorrect.find(n => 
    n.note === noteInfo.note && n.measure === noteInfo.measure
  );
  const pitchNote = pitchCorrect.find(n => 
    n.note === noteInfo.note && n.measure === noteInfo.measure
  );
  
  // Priority: rhythm > pitch > selection
  if (rhythmNote) {
    return rhythmNote.rhythmCorrect ? FEEDBACK_COLORS.rhythmCorrect : FEEDBACK_COLORS.rhythmIncorrect;
  }
  if (pitchNote) {
    return pitchNote.pitchCorrect ? FEEDBACK_COLORS.pitchCorrect : FEEDBACK_COLORS.pitchIncorrect;
  }
  if (selectedTimes === 1) return FEEDBACK_COLORS.selected;
  if (selectedTimes === 2) return FEEDBACK_COLORS.neutral;
  
  return FEEDBACK_COLORS.neutral;
};
