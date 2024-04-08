import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/doof.png';
import './App.css';
//import BoopButton from "./components/audiohander"
import { HomePage } from './components/homepage';
import { HelpPage } from './components/helppage';
import { ExercisesPage } from './components/exercisespage';
import { ExerciseManagementPage} from './components/exercise-managementpage';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Interface } from 'readline';
import ExerciseData from './interfaces/exerciseData';

//import Navbar from "./components/navbar"

function App() {
  const [correctAnswers, setCorrectAnswers] = useState<Array<String>>();
  
  const [files, setFiles] = useState<File[]>([]);
  const [allExData,setAllExData] = useState<(ExerciseData | undefined)[]>([]);
  var globalIndex = allExData.length;
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar className="Home-bar" fixed='top'>
            <Navbar.Brand href="/">
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
              <Route path="/" element={<HomePage/>}/>
            </Routes>

            <Routes>
              <Route path="/exercises" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles={setFiles}></ExercisesPage>} />
            </Routes>

            <Routes>
              <Route path="/exercise-management" element={<ExerciseManagementPage allExData = {allExData} setAllExData = {setAllExData} files={files} setFiles = {setFiles}/>} />
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