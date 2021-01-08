import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(){
    super();
    // gives object that has access and refresh tokens
    const params = this.getHashParams();
    this.state = {
      loggedIn: params.access_token ? true : false,
      myPlaylists: {
        name: '',
        image: '',
        playlistId: ''
      }
    }
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  render() {
    return (
      <div className="App">
        <div>Home Page</div>

      </div>
    )
  }
}

export default App;
