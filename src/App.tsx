import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/doof.png';
import './App.css';
//import BoopButton from "./components/audiohander"
import { HelpPage } from './components/helppage';
import { ExercisesPage } from './components/exercisespage';
import { ExerciseManagementPage} from './components/exercise-managementpage';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//import Navbar from "./components/navbar"

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar className="Home-bar" fixed='top'>
            <Navbar.Brand href="#home">
              <img
                alt=""
                src={logo}
                width="75"
                height="75"
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
              <Route path="/exercises" element={<ExercisesPage />} />
            </Routes>

            <Routes>
              <Route path="/exercise-management" element={<ExerciseManagementPage />} />
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