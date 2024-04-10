import '../App.css';
import musicnote from "../assets/musicnote.jpg";
import othernote from "../assets/othernote.png";
import logo from '../assets/doof.png';
export function HomePage() {
    return (

            <div className="container ">
              <div><h1>Home Page</h1></div>
        <div className="work-list">
        <div className="work">
            <img src={musicnote} alt="note"/>
            <div className="layer">
            <h3>Upload Your Scores</h3>
              <p>
                Upload your scores paired with their mp3 files.
              </p>
             
            </div>
          </div>
          <div className="work">
            <img alt="" src={musicnote} />
            <div className="layer">
              <h3>Excersize Creation</h3>
              <p>
                Put enter messups within your score as excersizes for your students.
              </p>
            </div>
          </div>
         
          <div className="work">
            <img src={musicnote} alt="music note"/>
            <div className="layer">
              <h3>Actively correct scores</h3>
              <p>
                Memorize your scores by detecing the errors. 
              </p>
             
            </div>
          </div>
        </div>
       
      </div>
      
    );
}