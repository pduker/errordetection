import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/UD-circle-logo-email.png';
import './styles/global.css';
import './styles/app.css';
import './styles/controls.css';
import { HomePage } from './components/homepage';
import { HelpPage } from './components/helppage';
import { AboutPage } from './components/aboutpage';
import { ExercisesPage } from './components/exercisespage';
import { ExerciseManagementPage} from './components/exercise-managementpage';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ExerciseData from './interfaces/exerciseData';
import { getDatabase } from 'firebase/database';
import { ref, get, query, DataSnapshot, orderByKey } from 'firebase/database';
import isMobile from "./services/mobiledetection";

function Header({ authorized, resetScrollPosition }: { authorized: boolean; resetScrollPosition: (behavior?: ScrollBehavior) => void; }) {
  const handleNavClick = useCallback((targetPath: string) => {
    if (window.location.pathname === targetPath) {
      resetScrollPosition("auto");
    }
  }, [resetScrollPosition]);

  return (
  <header className="App-header">
        
    <Navbar className={`Home-bar ${isMobile ? "mobile" : ""}`} fixed={isMobile ? undefined : "top"}>

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
    <Link to="/exercises" style={{ marginRight: '10px' }} onClick={() => handleNavClick("/exercises")}>Exercises</Link>
    {authorized ?
    <Link to="exercise-management" style={{ marginRight: '10px' }} onClick={() => handleNavClick("exercise-management")}>Exercise Management</Link>
    : <></>}
    </Nav>

    <div style={{ position: 'absolute', right: '50%', transform: 'translateX(50%)', textAlign: 'center' }}>
      <div style={{display: 'flex', flexDirection:'column', alignItems: 'center', gap:0}}>
        <Navbar.Brand className='Home-title' style={{ color: '#114b96', display: 'block', marginBottom: '6px', lineHeight:1, fontSize: '30px'}}>
        University of Delaware
        </Navbar.Brand>
        <Navbar.Brand className='Home-title' style={{ color: '#114b96', display: 'block' }}>
        Aural Skills Error Detection Practice Site
        </Navbar.Brand>
      </div>
    </div>

    <Nav className='Home-nav-right'>
    <Link to="/about" style={{ marginLeft: '-225px' }} onClick={() => handleNavClick("/about")}>About</Link>
    <Link to="/help" style={{ marginLeft: '10px' }} onClick={() => handleNavClick("/help")}>Help</Link>
    </Nav>
    </Navbar>

    </header>
  );
}

//app function to initlize site
function App() {
  //state initialization
  const [allExData,setAllExData] = useState<(ExerciseData | undefined)[]>([]);
  const [scoresRetrieved, setScoresRetrieved] = useState<boolean>(false); // Track whether scores are retrieved
  const [authorized, setAuthorized] = useState<boolean>(false); // has the user put in the admin pwd on help page?

  // get data from the database
  const fetchScoresFromDatabase = useCallback(async () => {
    console.log("Retrieving scores...");

    try {
      const database = getDatabase();

      const exerciseList: ExerciseData[] = [];
      // fetch all scores from the database
      // we have a relatively low amount of scores, so this operation is very quick
      // if the scope of this application is larger in the future, look into pagination
      const scores = await get(query(ref(database, 'scores'), orderByKey()));
      
      if (!scores.exists()) {
        console.log("No scores found in database");
        setScoresRetrieved(true);
        return;
      }
      
      scores.forEach((scoreSnapshot: DataSnapshot) => { // for every score fetched,
        const score = scoreSnapshot.val(); // get the data fetched
        if(!score || !score.sound) return; // if these values aren't populated, something has gone seriously wrong!

        exerciseList.push(new ExerciseData( // add it to the list of exercises
          score.score,
          score.sound, // Firebase stores this as string filename, not File object
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

      setAllExData(exerciseList); // once we've fetched and filled out our list, commit it to React state
      setScoresRetrieved(true); // all done!

      console.log("Loaded exercise list");
    } catch (error) {
      console.error('Error fetching scores:', error);
      setScoresRetrieved(true); // Set to true to prevent infinite loading
    }
  }, []);

  // Manual refresh function for admin use
  const refreshExercises = useCallback(async () => {
    setScoresRetrieved(false);
    await fetchScoresFromDatabase();
  }, [fetchScoresFromDatabase]);

  useEffect(() => {
    fetchScoresFromDatabase(); // fetch from the database on component creation
  }, [fetchScoresFromDatabase]);
  
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const contentRef = useRef<HTMLDivElement | null>(null);
  const resetScrollPosition = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (!isLanding && contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior });
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior });
      }
    },
    [isLanding]
  );

  useLayoutEffect(() => {
    resetScrollPosition("auto");
  }, [location.pathname, resetScrollPosition]);

  return (
    <div>
      {
        isMobile ? "" : <Header authorized={authorized} resetScrollPosition={resetScrollPosition}/>
      }
      <div className={`pagediv ${isLanding ? "pagediv-landing" : ""} ${isMobile ? "mobile" : ""}`}>
      <div
        ref={contentRef}
        style={{
          overflowY: isLanding ? "hidden" : "scroll",
          margin: isLanding ? "0" : "10px",
          height: "100%",
          width: "100%",
          display: isLanding ? "flex" : "block",
          alignItems: isLanding ? "center" : undefined,
          justifyContent: isLanding ? "center" : undefined
        }}>
        <Routes>
            <Route path="/" element={<HomePage/>}></Route>
            <Route path="/exercises" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} defaultTags={[]} scoresRet={scoresRetrieved}/>}/>
            <Route path="/about" element={<AboutPage/>}/>
            <Route path="/exercises/intonation" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} defaultTags={["Intonation"]} scoresRet={scoresRetrieved}/>}/>
            <Route path="/exercises/pitch" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} defaultTags={["Pitch"]} scoresRet={scoresRetrieved}/>}/>
            <Route path="/exercises/rhythm" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} defaultTags={["Rhythm"]} scoresRet={scoresRetrieved}></ExercisesPage>}/>
            <Route path="exercise-management" element={<ExerciseManagementPage allExData = {allExData} setAllExData = {setAllExData} fetch={refreshExercises} authorized={authorized}/>}/>
            <Route path="/help" element={<HelpPage authorized={authorized} setAuthorized={setAuthorized}/>}/>
        </Routes>
      </div>
      </div>
      {
        isMobile ? <Header authorized={authorized} resetScrollPosition={resetScrollPosition}/> : ""
      }
    </div>
  );
}

export default App;
