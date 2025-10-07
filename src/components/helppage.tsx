/**
 * Help Page component
 *
 * Purpose:
 *  - Render a help landing page with topic cards that navigate to subpages.
 *  - Provide a simple admin login control used to toggle an authorization flag
 *    elsewhere in the app (backed by Firebase auth).
 *
 * Public API:
 *  - export function HelpPage({ authorized, setAuthorized })
 *      - authorized: boolean — current authorization state (read-only here)
 *      - setAuthorized: (authorized: boolean) => void — called to update auth state
 */

// Un-used imports, but could be used later
// import { sha256 } from 'js-sha256';
// import noteKey from "../assets/note-color-key.png"
// import exExample from "../assets/excersie-example.png"
// import execPage from "../assets/exc-page.png";
// import filterSec from "../assets/filterPage.png";
// import click from "../assets/noteClick.png";
// import check from "../assets/check-answer.png";

import { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./database"


//function for creating the help page, for authorized users
/**
 * HelpPage component
 *
 * Renders:
 *  - Header and grid of CardLink items linking to help subpages.
 *  - An admin login area (email + password + submit) used to toggle the
 *    authorized state via setAuthorized.
 *
 * Note: Inputs in the admin area are currently uncontrolled DOM elements
 * accessed with document.getElementById. See the file header for recommended changes.
 */
export function HelpPage({
    authorized,
    setAuthorized
}: {
    authorized: boolean;
    setAuthorized: ((authorized: boolean) => void);
}) {
    const [error, setError] = useState<boolean>(false);

    /**
     * CardLink
     *
     * Small presentational component that renders a clickable card linking to a route.
     *
     * Props:
     *  - to: string         (route to navigate to)
     *  - title: string      (card title)
     *  - subtitle?: string  (optional subtitle)
     *  - img?: string       (optional image src)
     *  - borderColor?: string (optional border color)
     */
    const CardLink = ({ to, title, subtitle, img, borderColor }: { to: string; title: string; subtitle?: string; img?: string; borderColor?: string }) => {
        return (
            <Link to={to} style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>
                <div style={{
                    width: 260,
                    height: 130,
                    margin: 0,               // <- removed margin so clickable area matches the Link
                    padding: 8,
                    backgroundColor: "rgb(252, 252, 211)",
                    borderRadius: 20,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    border: `4px solid ${borderColor ?? "transparent"}`,
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    boxSizing: "border-box"
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

    /**
     * login
     *
     * Sign in using Firebase auth. On success, call setAuthorized(true) and clear errors.
     * On failure, set the error flag which triggers a simple UI message.
     *
     * Note: Avoid logging sensitive data. Only the authenticated user's email is logged here.
     */
    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in as:", userCredential.user.email);
            // Set admin privileges based on login
            setAuthorized(true);
            setError(false);
        } catch (error) {
            // In production, surface a user-friendly message and log error details securely.
            console.error("Login failed");
            setError(true);
        }
    };

    /**
     * checkAuth
     *
     * Read values from the DOM inputs and call `login`.
     *
     * Implementation detail:
     *  - This is using uncontrolled inputs (document.getElementById). Prefer converting
     *    to controlled inputs with useState or using refs for a cleaner React approach.
     */
    const checkAuth = function () {
        var box1 = document.getElementById("mng-email");
        var box2 = document.getElementById("mng-pwd");
        if (box2 !== null && "value" in box2 && box1 !== null && "value" in box1) {
            var email = box1.value as string;
            var password = box2.value as string;
            login(email, password);
        }
    }

    //rendering page with help information
    // NOTE: content is scrollable and the admin area is fixed to the viewport bottom
    // The content area has extra bottom padding so it won't be hidden behind the fixed footer.
    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 16 }}>
                <h2 style={{ textAlign: "center" }}>Welcome to the Help Page!</h2>

                <div style={{ textAlign: "center", marginTop: 8 }}>
                    Click a card to open a dedicated help page for that topic.
                </div>

                {/* Top grid of clickable cards that navigate to subpages (2-column) */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(260px, 360px))",
                    gap: 16,
                    justifyContent: "center",
                    justifyItems: "center", // center contents inside each grid cell
                    margin: "12px 0"
                }}>
                    <CardLink to="/help/exercises" title="Exercises" subtitle="Browse practice exercises" borderColor="#1aa654" />
                    <CardLink to="/help/filters" title="Filters" subtitle="Sorting and finding exercises" borderColor="#2b78d8" />
                    <CardLink to="/help/example" title="Exercise Example" subtitle="Score + audio example" borderColor="#f59e42" />
                    <CardLink to="/help/clicking-notes" title="Clicking Notes" subtitle="How to mark errors" borderColor="#1fb6a8" />
                    <CardLink to="/help/key" title="Color Key" subtitle="What each color means" borderColor="#9b5fd3" />
                    <CardLink to="/help/check-answers" title="Check Answers" subtitle="Feedback & hints" borderColor="#e34a4a" />
                </div>
            </div>

            {/* Admin footer fixed to viewport bottom (not part of the scrollable content) */}
            <footer style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: 15, borderTop: "1px solid #eee", background: "#fafafa", textAlign: "center", zIndex: 10 }}>
                {/* admin login kept for toggling admin UI elsewhere */}
                {/* NOTE: Inputs below are currently uncontrolled and lack labels / password masking.
                    Recommended: convert to controlled inputs (useState), add labels, and set
                    password input to type="password" for improved security and UX. */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                    <input id="mng-email" placeholder="Enter admin email..."></input>
                    <input id="mng-pwd" placeholder="Enter admin password..."></input>
                    <button onClick={checkAuth}>Submit</button>
                </div>
                {error ? <div style={{color: "red", marginTop: 8}}>Incorrect password.</div> : null}
            </footer>
        </div>
    );
}
