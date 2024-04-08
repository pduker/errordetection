import { useState } from "react";

export function HelpPage({
    setAuthorized
}: {
    setAuthorized: ((authorized: boolean) => void);
}) {
    const [error, setError] = useState<boolean>(false);

    const checkAuth = function() {
        var box = document.getElementById("mng-pwd");
        if(box !== null && "value" in box) {
            var str = box.value as string;
            if(str === "ILoveMusic") {
                setAuthorized(true);
                setError(false);
            } else {
                setError(true);
            }
        }
    }

    return (
        <div>
            <h2>Welcome to the Help Page!</h2>
            <input type="password" id="mng-pwd" placeholder="Enter admin password..."></input>
            <button onClick={checkAuth}>Submit</button>
            {error ? <div style={{color: "red"}}>Incorrect password.</div> : <></>}
        </div>
    );
}
