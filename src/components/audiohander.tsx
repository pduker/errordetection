import React from 'react';
//import { useRef } from "react";
import useSound from 'use-sound';
import { Button } from "react-bootstrap";
import sound from "../assets/audios/lego-yoda-death-sound-effect.mp3"

export default function BoopButton(): JSX.Element {
  const [play,{stop}] = useSound(sound);
  
  return (
    <span>
        <div> 
            <Button onClick={()=>play()}> play! </Button> 
        </div>
        <div> 
            <Button onClick={()=>stop()}> stop! </Button> 
        </div>
    </span>
    );
};