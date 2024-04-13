import React, { useEffect, useState } from 'react';
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
import DBData from './interfaces/DBData';
import { getDatabase } from 'firebase/database';
import { ref, push, onValue, DataSnapshot } from 'firebase/database';
import { getBlob, getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage';

//import Navbar from "./components/navbar"

function App() {
  const [allExData,setAllExData] = useState<(ExerciseData | undefined)[]>([]);
  const [scoresRetrieved, setScoresRetrieved] = useState<boolean>(false); // Track whether scores are retrieved
  const [authorized, setAuthorized] = useState<boolean>(false); // has the user put in the admin pwd on help page?
  const fetchScoresFromDatabase = async () => {
    if(!scoresRetrieved) {
      console.log("Retrieving scores");
      try {
        const database = getDatabase();
        const scoresRef = ref(database, 'scores');
        onValue(scoresRef, (snapshot) => {
          const scoresData: DBData[] = [];
          snapshot.forEach((childSnapshot: DataSnapshot) => {
            const score = childSnapshot.val();
            if (score) {
              scoresData.push(score);
            }
          });
          // Update state with scores retrieved from the database
          const scoresData2: ExerciseData[] = [];
          const storage = getStorage();
          //const audioref = storageRef(storage, "mp3Files");
          scoresData.forEach(async function (value) {
            if(value.sound){
            const blob = await getBlob(storageRef(storage, value.sound));
            console.log(blob);
            //let response = await fetch(blob);
            //let data = await response.blob();
            var file = new File([blob], value.sound, {type: "audio/mpeg"})
            var thing = new ExerciseData(value.score,file,value.correctAnswers,value.feedback,value.exIndex,value.empty,value.title,value.difficulty,value.tags);
            scoresData2.push(thing);
            console.log(thing);}
        });
          setAllExData(scoresData2);
          setScoresRetrieved(true); // Set scoresRetrieved to true after retrieving scores
        });
      } catch (error) {
        console.error('Error fetching scores:', error);
        // Add additional error handling if necessary
      }
    }
    console.log(allExData);
  };

  useEffect(()=>{fetchScoresFromDatabase()});
  
  return (
    <Router>
      <div >
        <header className="App-header" >
          
          <Navbar className="Home-bar" fixed='top'>
            <Navbar.Brand href="/home">
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
            {authorized ?
            <Link to="/exercise-management">Exercise Management</Link>
            : <></>}
            <Link to="/help">Help</Link>
            </Nav>
          </Navbar>
          
        </header>
        
          <body>
          <Routes>
              <Route path="/" element={<HomePage/>}/>
            </Routes>

            <Routes>
              <Route path="/exercises" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData}></ExercisesPage>} />
            </Routes>

            <Routes>
              <Route path="/exercise-management" element={<ExerciseManagementPage allExData = {allExData} setAllExData = {setAllExData}/>} />
            </Routes>

            <Routes>
              <Route path="/help" element={<HelpPage setAuthorized={setAuthorized}/>} />
            </Routes>
          </body>

      </div>
    </Router>
  );

}

export default App;