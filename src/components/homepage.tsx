import '../App.css';
import musicnote from "../assets/musicnote.jpg";
import othernote from "../assets/othernote.png";
import logo from '../assets/doof.png';
import { Link } from 'react-router-dom';

export function HomePage() {
  const intLink = function () {
    var exLink = document.getElementById("intLink");
    if(exLink !== null) exLink.click();
  }
  const pitchLink = function () {
    var exLink = document.getElementById("pitchLink");
    if(exLink !== null) exLink.click();
  }
  const rhyLink = function () {
    var exLink = document.getElementById("rhyLink");
    if(exLink !== null) exLink.click();
  }
    return (
        <div className="container ">
          <div><h1>Home Page</h1></div>
          <div className="work-list">

            <div className="work" onClick={pitchLink}>
              <img alt="" src={musicnote} />
              <div className="layer">
                <h3>Jump to Pitch Exercises</h3>
                {/* <p>
                  Put enter messups within your score as excersizes for your students.
                </p> */}
              </div>
            </div>
          
            <div className="work" onClick={rhyLink}>
              <img src={musicnote} alt="music note"/>
              <div className="layer">
                <h3>Jump to Rhythm Exercises</h3>
                {/* <p>
                  Memorize your scores by detecing the errors. 
                </p> */}
              
              </div>
            </div>

            <div className="work" onClick={intLink}>
              <img src={musicnote} alt="note"/>
              <div className="layer">
              <h3>Jump to Intonation Exercises</h3>
              {/* 
                <p>
                  To Intonation exercises
                </p> */}
              
              </div>
            </div>
            
            <Link id="intLink" to="/exercises/intonation" hidden={true}></Link>
            <Link id="pitchLink" to="/exercises/pitch" hidden={true}></Link>
            <Link id="rhyLink" to="/exercises/rhythm" hidden={true}></Link>
          </div>
          <br></br>
          <h3>About</h3>
          <div>This website is a music reading and listening practice tool! 
            Choose a category of exercises above to get started, or visit the Help page to learn more.</div>
       
      </div>
    );
}