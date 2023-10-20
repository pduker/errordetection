import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/doof.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar className="Home-bar" fixed='top'>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src={logo}
              width="75"
              height="75"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Brand>Error Detectinator!</Navbar.Brand>
          <Nav className='Home-nav' justify>
            <Nav.Link href="#exercises">Exercises</Nav.Link>
            <Nav.Link href="#exercise-management">Exercise Management</Nav.Link>
            <Nav.Link href="#help">Help</Nav.Link>
          </Nav>
        </Navbar>
      </header>
    </div>
  );
}

export default App;
