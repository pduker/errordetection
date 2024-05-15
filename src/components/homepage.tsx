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
  /* const rhyLink = function () {
    var exLink = document.getElementById("rhyLink");
    if(exLink !== null) exLink.click();
  } */
    return (
        <div className="container ">
          
          <center><h1>University of Delaware </h1></center>
          <center><h1>Aural Skills Error Detection Practice Site</h1></center>
          <div className="work-list">

            <div className="work" onClick={pitchLink}>
              <img alt="" src={musicnote} />
              <div className="layer">
                <h2>Jump to Pitch Exercises</h2>
              </div>
            </div>
          
            {/* <div className="work" onClick={rhyLink}>
              <img src={musicnote} alt="music note"/>
              <div className="layer">
                <h3>Jump to Rhythm Exercises</h3>
              </div>
            </div> */}

            <div className="work" onClick={intLink}>
              <img src={musicnote} alt="note"/>
              <div className="layer">
              <h2>Jump to Intonation Exercises</h2>
              </div>
            </div>
            
            <Link id="intLink" to="/exercises/intonation" hidden={true}></Link>
            <Link id="pitchLink" to="/exercises/pitch" hidden={true}></Link>
            {/* <Link id="rhyLink" to="/exercises/rhythm" hidden={true}></Link> */}
          </div>

      </div>
    );
}
