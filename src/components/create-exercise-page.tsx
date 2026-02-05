import React from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateExercisePage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Create New Exercise</h2>
      <p>This is the page where you can create a new exercise. For now, this is just placeholder text.</p>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => navigate('/exercise-management')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Back to Exercise Management
        </button>
      </div>
    </div>
  );
}
