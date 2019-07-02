import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
import logo from "./logo.png";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0,
      time_elapsed: 0
    };
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    // this.postNextTrack = this.postNextTrack.bind(this);
  }
  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      this.getCurrentlyPlaying(_token);
      this.interval = setInterval(() => {
        console.log(this.state.time_elapsed, this.state.time_elapsed >= 6);
        this.setState({ time_elapsed: this.state.time_elapsed + 1 });
        if (this.state.time_elapsed % 60 == 0) {
          this.postNextTrack(_token);
          this.sleep(300);
          this.getCurrentlyPlaying(_token);
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        console.log("data", data);
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms
        });
      }
    });
  }

  postNextTrack(token) {
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/next",
      type: "POST",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }
      // success: data => {
      //   console.log("data", data);
      //   this.setState({
      //     item: data.item,
      //     is_playing: data.is_playing,
      //     progress_ms: data.progress_ms
      //   });
      // }
    });
    // clearInterval(this.interval);
    // this.getCurrentlyPlaying(token);
  }

  sleep(millisecondsToWait) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + millisecondsToWait) {}
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
          {this.state.token && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
            />
          )}
        </header>
        <footer>source: https://github.com/ryanlevi/shotify</footer>
      </div>
    );
  }
}

export default App;
