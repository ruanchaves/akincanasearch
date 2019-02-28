import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReadAll from './components/ReadAll';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <ReadAll />
        </header>
      </div>
    );
  }
}

export default App;
