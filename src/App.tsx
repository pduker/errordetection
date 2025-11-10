import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import { getDatabase } from 'firebase/database';
import { ref, get, DataSnapshot, orderByKey, query } from 'firebase/database';

import ExerciseData from './interfaces/exerciseData';
import { HelpPage } from './components/helppage';
import { AboutPage } from './components/aboutpage';
import { ExercisesPage } from './components/exercisespage';
import { ExerciseManagementPage} from './components/exercise-managementpage';
import { ExercisesPageWrapper } from './components/exercisepagewrapper';

import './App.css';
import logo from './assets/UD-circle-logo-email.png';

async function fetchScoresFromDatabase(): Promise<ExerciseData[]> {
  console.log("Retrieving scores...");

  try {
    const database = getDatabase();

    const exerciseList: ExerciseData[] = [];
    // fetch all scores from the database
    // we have a relatively low amount of scores, so this operation is very quick
    // if the scope of this application is larger in the future, look into pagination
    const scores = await get(query(ref(database, 'scores'), orderByKey()));
    scores.forEach((scoreSnapshot: DataSnapshot) => { // for every score fetched,
      const score = scoreSnapshot.val(); // get the data fetched
      if(!score || !score.sound) return; // if these values aren't populated, something has gone seriously wrong!

      exerciseList.push(new ExerciseData( // add it to the list of exercises
        score.score,
        score.sound,
        score.correctAnswers,
        score.feedback,
        score.exIndex,
        score.empty,
        score.title,
        score.difficulty,
        score.voices,
        score.tags,
        score.types,
        score.meter,
        score.transpos,
        undefined,
        score.customId
      ));
    });

    console.log("Got exercise list");
    return exerciseList;
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}

// app function to initialize site
function App() {
  const [allExData,setAllExData] = useState<ExerciseData[]>([]);
  const [scoresRetrieved, setScoresRetrieved] = useState<boolean>(false); // track whether scores are retrieved
  const [authorized, setAuthorized] = useState<boolean>(false); // has the user put in the admin pwd on help page?

  useEffect(() => {
    if(scoresRetrieved) return;
    fetchScoresFromDatabase().then(exerciseData => {
      setAllExData(exerciseData);
      setScoresRetrieved(true);
    }); // fetch from the database on component creation
  }, [setAllExData, scoresRetrieved, setScoresRetrieved]);
  
  return (
    <Router>
      <div>
        <header className="App-header">
          <Navbar className="Home-bar" fixed='top'>
            <Navbar.Brand>
              <img
                alt=""
                src={logo}
                width="60"
                height="60"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>

            <Nav className='Home-nav'>
              <Link to="/exercises" style={{ marginRight: '10px' }}>Exercises</Link>
              {
                authorized
                  ? <Link to="/exercise-management" style={{ marginRight: '10px' }}>Exercise Management</Link>
                  : ""
              }
            </Nav>

            <div style={{ position: 'absolute', right: '50%', transform: 'translateX(50%)', textAlign: 'center' }}>
              <Navbar.Brand className='Home-title' style={{ color: '#114b96', display: 'block', marginBottom: '5px' }}>
                University of Delaware
              </Navbar.Brand>
              <Navbar.Brand className='Home-title' style={{ color: '#114b96', display: 'block' }}>
                Aural Skills Error Detection Practice Site
              </Navbar.Brand>
            </div>

            <Nav className='Home-nav-right'>
              <Link to="/about" style={{ marginLeft: '-225px' }}>About</Link>
              <Link to="/help" style={{ marginLeft: '10px' }}>Help</Link>
            </Nav>
          </Navbar>
        </header>

        <div className='pagediv'>
          <div  style={{overflowY: "scroll",margin: "10px"}}>
            <Routes>
              <Route path="/" element={<Navigate to="/exercises"/>}/>
              <Route path="/errordetection" element={<Navigate to="/exercises"/>}/>

              <Route path="/exercises" element={<ExercisesPage allExData={allExData} setAllExData={setAllExData}/>}/>
              <Route path="/exercises/intonation" element={<ExercisesPage allExData={allExData} setAllExData={setAllExData} defaultTags={["Intonation"]}/>}/>
              <Route path="/exercises/pitch" element={<ExercisesPage allExData={allExData} setAllExData={setAllExData} defaultTags={["Pitch"]}/>}/>

              <Route path="/exercise-management" element={<ExerciseManagementPage allExData={allExData} setAllExData={setAllExData} fetch={fetchScoresFromDatabase} authorized={authorized}/>}/>

              <Route path="/about" element={<AboutPage/>}/>
              <Route path="/help" element={<HelpPage authorized={authorized} setAuthorized={setAuthorized}/>}></Route>
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
