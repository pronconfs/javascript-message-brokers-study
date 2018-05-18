import React, {Component } from 'react';
import logo from './logo.svg';
import './App.css';

import config from './settings/config.json';
import Client from './MqttClient';

class App extends Component {
  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      clientId : '',
      topic : '',
      message : ''
    }    
    this.mqttClient = new Client(config.subscriptions, process.argv[2], true, 2);
  }

  handleInput(event) {
    this.setState({
      [event.target.name] : event.target.value
    })
  }

  handleSubmit(event) {        
    this.mqttClient.publishMessage(this.state.topic, this.state.message);
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>        
        <form onSubmit={this.handleSubmit}>
          <label>
            Client id
            <input value={this.state.clientId} onChange={this.handleInput} type="text" name="clientId" />
          </label>
          <label>
            Topic
            <input value={this.state.topic} onChange={this.handleInput} type="text" name="topic" />
          </label>
          <label>
            Message
            <input value={this.state.message} onChange={this.handleInput} type="text" name="message" />
          </label>
          <input type="submit" value="Publish" />
        </form>
      </div>
    );
  }
}

export default App;
