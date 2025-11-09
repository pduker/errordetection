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
    "Trevor ___",
    "Aaron ___",
    "Olivia ____",
    "Matt ___",
    "Roger ___"
];

const supporters = [
    "Erin Sicuranza",
    "Colleen Kelemen",
    "Racine Lewis",
    "Jessica Schroeder"
];

export function AboutPage() {
    return (
        <div className="about-page">
            <section className="about-hero">
                <p className="eyebrow">About the project</p>
                <h1>Practice error detection with confidence</h1>
                <p>
                    This site was built to give future engineers, scientists, and problem solvers
                    a safe place to practice tracking down errors. Choose a category of exercises above,
                    or visit the Help page to learn how the activities work.
                </p>
                <div className="about-highlight">
                    See an issue or have an idea? Reach out to Phil Duker and we will keep improving.
                </div>
            </section>

            <section className="about-panels">
                <article className="about-panel">
                    <h2>What you&apos;ll find</h2>
                    <p>
                        Guided, bite-sized scenarios that teach stronger debugging habits. Each activity
                        focuses on identifying why something failed—not just memorizing the right answer.
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
                    <h2>Support + Contact</h2>
                    <p>Academic Technology Services partners who made implementation possible.</p>
                </div>
                <div className="contact-card">
                    <div>
                        <p>
                            Supported by Erin Sicuranza, Colleen Kelemen, Racine Lewis, and Jessica Schroeder.
                        </p>
                        <p>
                            Have a suggestion, spot an error, or want to collaborate? Email Phil Duker and let us know how we can help.
                        </p>
                    </div>
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
    );
}
