import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import logo from './assets/doof.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Error Detectinator!</p>
        <Navbar/>
      </header>
    </div>
  );
}

export default App;
