import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/doof.png';
import './App.css';
//import BoopButton from "./components/audiohander"
import { HelpPage } from './components/helppage';
import { ExercisesPage } from './components/exercisespage';
import { ExerciseManagementPage} from './components/exercise-managementpage';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Interface } from 'readline';
import ExerciseData from './interfaces/exerciseData';
import { getDatabase } from 'firebase/database';
import { ref, push, onValue, DataSnapshot } from 'firebase/database';

//import Navbar from "./components/navbar"

function App() {
  const [allExData,setAllExData] = useState<(ExerciseData | undefined)[]>([]);
  const [scoresRetrieved, setScoresRetrieved] = useState<boolean>(false); // Track whether scores are retrieved
  const fetchScoresFromDatabase = async () => {
    if(!scoresRetrieved) {
      console.log("Retrieving scores");
      try {
        const database = getDatabase();
        const scoresRef = ref(database, 'scores');
        onValue(scoresRef, (snapshot) => {
          const scoresData: ExerciseData[] = [];
          snapshot.forEach((childSnapshot: DataSnapshot) => {
            const score = childSnapshot.val();
            if (score) {
              scoresData.push(score);
            }
          });
          // Update state with scores retrieved from the database
          setAllExData(scoresData);
          setScoresRetrieved(true); // Set scoresRetrieved to true after retrieving scores
        });
      } catch (error) {
        console.error('Error fetching scores:', error);
        // Add additional error handling if necessary
      }
    }
  };
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar className="Home-bar" fixed='top'>
            <Navbar.Brand href="#home">
              <img
                alt=""
                src={logo}
                width="90"
                height="90"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>
            <Navbar.Brand>Error Detectinator!</Navbar.Brand>
            <Nav className='Home-nav' justify>
            <Link to="/exercises">Exercises</Link>
            <Link to="/exercise-management">Exercise Management</Link>
            <Link to="/help">Help</Link>
            </Nav>
          </Navbar>
        </header>
        
          <main>
            <Routes>
              <Route path="/exercises" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} fetch={fetchScoresFromDatabase}></ExercisesPage>} />
            </Routes>

            <Routes>
              <Route path="/exercise-management" element={<ExerciseManagementPage allExData = {allExData} setAllExData = {setAllExData} fetch={fetchScoresFromDatabase}/>} />
            </Routes>

            <Routes>
              <Route path="/help" element={<HelpPage />} />
            </Routes>
          </main>

      </div>
    </Router>
  );

}

export default App;