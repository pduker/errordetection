import { Link } from "react-router-dom";

const contributors = [
    "Alex Daley",
    "Weldin Dunn",
    "Benjamin McMonagle",
    "Sean O'Sullivan",
    "Sonika Sharma",
    "Colin Stetler",
    "Victor Umoren-Udo",
    "Lillian Woulfe",
    "Adam Beck",
    "Sehee Hwang",
    "Michael Murphy",
    "Mann Patel",
    "Tyran Rice",
    "Sydni Wright",
    "Jared Miller",
    "Sophia Romero",
    "Trevor Brennan",
    "Aaron Riley",
    "Olivia Bouvier",
    "Matthew Nadar",
    "Roger Cronin"
];

const supporters = [
    "Erin Sicuranza",
    "Colleen Kelemen",
    "Racine Lewis",
    "Jessica Schroeder"
];

export function AboutPage() {
    return (
        <div className="about-page-wrapper">
            <div className="about-page">
                <section className="about-hero">
                    <p className="eyebrow">About the project</p>
                    <h1>Practice error detection with confidence</h1>
                    <p>
                        This is an error detection practice tool for musicians. Choose a category of exercises to get started or 
                        visit the <Link to="/help" className="inline-link">help</Link> page to learn more.
                    </p>
                    <div className="about-highlight">
                        Have a suggestion, spot an error, or want to collaborate?
                        Email <a className="inline-link highlight-email" href="mailto:pduker@udel.edu">Phil Duker</a> and let us know how we can help.
                    </div>
                </section>

                <section className="about-panels">
                    <article className="about-panel">
                        <h2>What you&apos;ll find</h2>
                        <p>
                            Guided, bite-sized aural drills that sharpen listening accuracy. Each activity
                            focuses on identifying where the musical passage went wrong—not just memorizing
                            the correct version.
                        </p>
                    </article>
                    <article className="about-panel">
                        <h2>Who built it</h2>
                        <p>
                            The project is led by Phil Duker and powered by an incredible group of UD students
                            who contributed design ideas, content, and testing to make the practice sets engaging.
                        </p>
                    </article>
                    <article className="about-panel">
                        <h2>How it&apos;s supported</h2>
                        <p>
                            Funded through a Paul J. Rickards, Jr. Teaching Innovation Grant and supported by the
                            University of Delaware Academic Technology Services team.
                        </p>
                    </article>
                </section>

                <section className="about-contributors">
                    <div className="section-heading">
                        <h2>Student contributors</h2>
                        <p>Thanks to the students who shaped the lessons, tested prototypes, and shared feedback.</p>
                    </div>
                    <div className="chip-grid" aria-label="Student contributors">
                        {contributors.map((name) => (
                            <span className="chip" key={name}>
                                {name}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="about-support">
                    <div className="section-heading">
                        <h2>Supporters</h2>
                        <p>Academic Technology Services partners who made implementation possible.</p>
                    </div>
                    <div className="contact-card">
                        <div className="support-list" aria-label="Support team">
                            {supporters.map((name) => (
                                <span className="support-pill" key={name}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
