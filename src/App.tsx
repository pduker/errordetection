import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/UD-circle-logo-email.png';
import './styles/global.css';
import './styles/app.css';
import { HelpPage } from './components/helppage';
import { AboutPage } from './components/aboutpage';
import { ExercisesPage } from './components/exercisespage';
import { ExerciseManagementPage} from './components/exercise-managementpage';
import { CreateExercisePage } from './components/exercise-creation';
import { LoadingScreen, useFirstVisit } from './components/loading-screen';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
  <header className="App-header">
        
  <Navbar expand="lg" className="Home-bar" fixed="top">

    <Navbar.Brand>
      <img
      alt=""
      src={logo}
      width="60"
      height="60"
      className="d-inline-block align-top"
    />
    </Navbar.Brand>
     
    {/* Hamburger button for mobile view */}
    <Navbar.Toggle aria-controls="main-navbar" />

    <Navbar.Collapse id="main-navbar">

    {/* Left-aligned nav links */}
      <Nav className='Home-nav'>
      <Link to="/exercises" style={{ marginRight: '10px' }} onClick={() => handleNavClick("/exercises")}>Exercises</Link>
      {authorized ?
      <Link to="exercise-management" style={{ marginRight: '10px' }} onClick={() => handleNavClick("exercise-management")}>Exercise Management</Link>
      : <></>}
      </Nav>

      <Nav className='Home-nav-right'>
      <Link to="/about" onClick={() => handleNavClick("/about")}>About</Link>
      <Link to="/help" onClick={() => handleNavClick("/help")}>Help</Link>
      </Nav>
    </Navbar.Collapse>
    </Navbar>

    </header>
  );
}

//app function to initlize site
function App() {
  //state initialization
  const [allExData,setAllExData] = useState<(ExerciseData | undefined)[]>([]);
  const [scoresRetrieved, setScoresRetrieved] = useState<boolean>(false); // Track whether scores are retrieved
  const [authorized, setAuthorized] = useState<boolean>(() => {
    // Check localStorage on initial load to restore admin state
    const savedAuth = localStorage.getItem('adminAuthorized');
    return savedAuth === 'true';
  }); // has the user put in the admin pwd on help page?
  
  const isFirstVisit = useFirstVisit();

  // get data from the database
  const fetchScoresFromDatabase = useCallback(async () => {
    // TODO: Remove this console log in production
    console.log("Retrieving scores...");

    try {
      const database = getDatabase();

      const exerciseList: ExerciseData[] = [];
      // fetch all scores from the database
      // we have a relatively low amount of scores, so this operation is very quick
      // if the scope of this application is larger in the future, look into pagination
      const scores = await get(query(ref(database, 'scores'), orderByKey()));
      
      if (!scores.exists()) {
        // TODO: Remove this console log in production
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
    } catch (error) {
      // TODO: Remove this console log in production
      console.error('Error fetching scores:', error);
      setScoresRetrieved(true); // Set to true to prevent infinite loading
    }
  }, []);

  // Wrapper function to update authorization state and localStorage
  const updateAuthorized = useCallback((newAuthState: boolean) => {
    setAuthorized(newAuthState);
    if (newAuthState) {
      localStorage.setItem('adminAuthorized', 'true');
    } else {
      localStorage.removeItem('adminAuthorized');
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
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Show loading screen on first visit or when refreshing on exercises page
    const isExercisesPage = location.pathname.startsWith('/exercises');
    setShowLoading(isFirstVisit || isExercisesPage);
  }, [location.pathname, isFirstVisit]);
  
  const contentRef = useRef<HTMLDivElement | null>(null);
  const resetScrollPosition = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior });
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior });
      }
    },
    []
  );

  useLayoutEffect(() => {
    resetScrollPosition("auto");
  }, [location.pathname, resetScrollPosition]);

  useEffect(() => {
    console.log('isMobile:', isMobile, 'contentRef:', contentRef.current);
  }, [isMobile, contentRef]);

  return (
    <div className={isMobile ? "is-mobile" : ""}>
      {showLoading && <LoadingScreen />}
      {
        isMobile ? "" : <Header authorized={authorized} resetScrollPosition={resetScrollPosition}/>
      }
      <div className={`pagediv ${isMobile ? "mobile" : ""}`}>
      <div
        ref={contentRef}
        style={{
          overflowY: "scroll",
          margin: isMobile ? "10px" : "30px",
          height: isMobile ? "calc(100% - 20px)" : "calc(100% - 60px)",
          width: "100%",
          display: "block"
        }}>
        <Routes>
            <Route path="/" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} defaultTags={[]} scoresRet={scoresRetrieved}/>}></Route>
            <Route path="/exercises" element={<ExercisesPage allExData = {allExData} setAllExData = {setAllExData} defaultTags={[]} scoresRet={scoresRetrieved}/>}/>
            <Route path="/about" element={<AboutPage/>}/>
            <Route path="/exercises/intonation" element={<Navigate replace to="/exercises?tags=Intonation"/>}/>
            <Route path="/exercises/pitch" element={<Navigate replace to="/exercises?tags=Pitch"/>}/>
            <Route path="/exercises/rhythm" element={<Navigate replace to="/exercises?tags=Rhythm"/>}/>
            <Route path="/exercise-management" element={<ExerciseManagementPage allExData = {allExData} setAllExData = {setAllExData} fetch={refreshExercises} authorized={authorized} setAuthorized={updateAuthorized}/>}/>
            <Route path="/exercise-management/create/:exerciseId" element={<CreateExercisePage allExData={allExData} setAllExData={setAllExData} refreshExercises={refreshExercises}/>}/>
            <Route path="/exercise-management/edit/:exerciseId" element={<CreateExercisePage allExData={allExData} setAllExData={setAllExData} refreshExercises={refreshExercises}/>}/>
            <Route path="/exercise-management/create/" element={<Navigate to="/exercise-management" replace/>}/>
            <Route path="/exercise-management/edit/" element={<Navigate to="/exercise-management" replace/>}/>
            <Route path="/help" element={<HelpPage authorized={authorized} setAuthorized={updateAuthorized}/>}/>
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
