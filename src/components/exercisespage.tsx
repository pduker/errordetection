import React from 'react';
import  abcjs from 'abcjs';


function clickListener(abclem:object, tuneNumber: number,classes:string, analysis:abcjs.ClickListenerAnalysis, drag:abcjs.ClickListenerDrag){
    var output = "abcelem: [Object]<br>tuneNumber: " + tuneNumber + "<br>classes: " + classes + "<br>analysis: " + JSON.stringify(analysis) + "<br>drag: " + JSON.stringify(drag);
    var test = document.querySelector(".clicked-info");
    if(test !== null) {test.innerHTML = "<div class='label'>Clicked info:</div>" + output;}}

export function ExercisesPage() {
    var abcString = "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3";
    var el = document.getElementById("target")
    if(el != null){abcjs.renderAbc(el,abcString,{ clickListener: clickListener});}



    
    return (
        <div>
            <h2>Welcome to the Exercises Page!</h2>

            <span>
                <div id ="target">test</div>
                <div className="clicked-info"></div>

                
            </span>
        </div>

    );
}
