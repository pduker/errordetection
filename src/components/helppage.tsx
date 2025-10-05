//imports
import { useState } from "react";
// import { sha256 } from 'js-sha256';
import noteKey from "../assets/note-color-key.png"
import exExample from "../assets/excersie-example.png"
import execPage from "../assets/exc-page.png";
import filterSec from "../assets/filterPage.png";
import click from "../assets/noteClick.png";
import check from "../assets/check-answer.png";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./database"

//function for creating the help page, for authorized users
export function HelpPage({
    authorized,
    setAuthorized
}: {
    authorized: boolean;
    setAuthorized: ((authorized: boolean) => void);
}) {
    const [error, setError] = useState<boolean>(false);

    const CardLink = ({ to, title, subtitle, img }: { to: string; title: string; subtitle?: string; img?: string }) => {
        return (
            <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                    width: 260,
                    height: 130,
                    margin: 10,
                    padding: 12,
                    backgroundColor: "white",
                    borderRadius: 8,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer"
                }}>
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700 }}>{title}</div>
                        {subtitle ? <div style={{ fontSize: 12, marginTop: 6 }}>{subtitle}</div> : null}
                    </div>
                    {img ? <img alt={title} src={img} style={{ width: 66, height: 66, objectFit: "cover", borderRadius: 6 }} /> : null}
                </div>
            </Link>
        );
    };

    //checking user with login functionality
    const login = async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("Logged in as:", userCredential.user.email);
          // Set admin privileges based on login
          setAuthorized(true);
          setError(false);
        } catch (error) {
          console.error("Login failed");
          setError(true);
        }
    };
    
    const checkAuth = function() {
        var box1 = document.getElementById("mng-email");
        var box2 = document.getElementById("mng-pwd");
        if(box2 !== null && "value" in box2 && box1 !== null && "value" in box1) {
            var email = box1.value as string;
            var password = box2.value as string;
            login(email,password);
        }
    }

    //rendering page with help information
    return (
        <div>
            <h2 style={{textAlign: "center"}}>Welcome to the Help Page!</h2>

            {/* Top grid of clickable cards that navigate to subpages (2-column) */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(260px, 360px))",
                gap: 16,
                justifyContent: "center",
                margin: "12px 0"
            }}>
                <CardLink to="/help/exercises" title="Exercises" subtitle="Browse practice exercises" img={execPage} />
                <CardLink to="/help/filters" title="Filters" subtitle="Sorting and finding exercises" img={filterSec} />
                <CardLink to="/help/example" title="Exercise Example" subtitle="Score + audio example" img={exExample} />
                <CardLink to="/help/clicking-notes" title="Clicking Notes" subtitle="How to mark errors" img={click} />
                <CardLink to="/help/key" title="Color Key" subtitle="What each color means" img={noteKey} />
                <CardLink to="/help/check-answers" title="Check Answers" subtitle="Feedback & hints" img={check} />
            </div>

            <div style={{textAlign: "center", marginTop: 8}}>
                Click a card to open a dedicated help page for that topic.
            </div>

            {/* admin login kept for toggling admin UI elsewhere */}
            <div style={{margin: "6px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <input id="mng-email" placeholder="Enter admin email..."></input>
                <span style={{padding: "10px"}}></span>
                <input id="mng-pwd" placeholder="Enter admin password..."></input>
                <span style={{padding: "10px"}}></span>
                <button onClick={checkAuth}>Submit</button>
            </div>
            {error ? <div style={{color: "red", textAlign: "center"}}>Incorrect password.</div> : null}
        </div>
    );
}
