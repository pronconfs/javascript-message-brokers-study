import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PrimusChat from './lib/primusChat';
import PrimusTickets from './lib/primusTickets';
import PrimusVoice from './lib/primusVoice';
import { Button, ButtonToolbar } from 'react-bootstrap/lib';

import SocketMessage from './models/SocketMessage';

const VOICE_PORT = 4001;
const CHAT_PORT = 4002;
const TICKETS_PORT = 4003;

const VOICE_CHANNEL = 'VOICE';
const CHAT_CHANNEL = 'CHAT';
const TICKETS_CHANNEL = 'TICKETS';

let primusTickets;
let primusVoice;
let primusChat
class App extends Component {
  constructor() {
    super(); 
    this.state = {
      sockets : {
        hasVoice : false,
        hasChat : false,
        hasTickets : false
      }
    };
  }
  
  connectVoice() {
    if (this.state.sockets.hasVoice) {
      primusVoice.end();
      return this.setState({
        sockets : {
          hasVoice : false,
          hasTickets : this.state.sockets.hasTickets,
          hasChat : this.state.sockets.hasChat,
        }});
    }
    primusVoice = new PrimusVoice(`http://localhost:${VOICE_PORT}`);              
    primusVoice.on('open', () => {    
      this.setState({
        sockets : {
          hasVoice : true,
          hasTickets : this.state.sockets.hasTickets,
          hasChat : this.state.sockets.hasChat,
        }}); 
      primusVoice.write(new SocketMessage(true, 'VOICE MESSAGE', 'ACTION', VOICE_CHANNEL).data);        
    });          
    primusVoice.on('data', function (data) {   
      console.log('[VOICE SOCKET] ',data)   
    });
  }

  connectChat() {
    if (this.state.sockets.hasChat) {
      primusChat.end();
      return this.setState({
        sockets : {
          hasVoice : this.state.sockets.hasVoice,
          hasTickets : this.state.sockets.hasTickets,
          hasChat : false,
        }});
    }
    primusChat = new PrimusChat(`http://localhost:${CHAT_PORT}`);                    
    primusChat.on('open', () => {      
      this.setState({
        sockets : {
          hasVoice : this.state.sockets.hasVoice,
          hasTickets : this.state.sockets.hasTickets,
          hasChat : true,
        }});
      primusChat.write(new SocketMessage(true, 'CHAT MESSAGE', 'ACTION', CHAT_CHANNEL).data);
    });      
    primusChat.on('data', function (data) {
      console.log('[CHAT SOCKET] ',data)      
    }); 
  }

  connectTickets() {
    if (this.state.sockets.hasTickets) {
      primusTickets.end();
      return this.setState({
        sockets : {
          hasVoice : this.state.sockets.hasVoice,
          hasTickets : false,
          hasChat : this.state.sockets.hasChat,
        }});
    }
    primusTickets = new PrimusTickets(`http://localhost:${TICKETS_PORT}`);                  
    primusTickets.on('open', () => {      
      this.setState({
        sockets : {
          hasVoice : this.state.sockets.hasVoice,
          hasTickets : true,
          hasChat : this.state.sockets.hasChat,
        }});
      primusTickets.write(new SocketMessage(true, 'TICKETS MESSAGE', 'ACTION', TICKETS_CHANNEL).data);
    });      
    primusTickets.on('data', function (data) {   
      console.log('[TICKETS SOCKET] ',data)        
    });    
  }

  render() {
    return (
      <div className="App">        
        <head>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossOrigin="anonymous" />
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossOrigin="anonymous" />
        </head>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">POC RabbitMq</h1>
        </header>
        <div style={{paddingTop: '50px',display: 'flex', justifyContent: 'center'}}>
        <ButtonToolbar>
          <Button              
              bsStyle={this.state.sockets.hasVoice ? "success" : "warning"}
              onClick={this.connectVoice.bind(this)}              
          > VOICE
          </Button>
          <Button              
              bsStyle={this.state.sockets.hasChat ? "success" : "warning"}
              onClick={this.connectChat.bind(this)}              
          > CHAT
          </Button>
          <Button              
              bsStyle={this.state.sockets.hasTickets ? "success" : "warning"}
              onClick={this.connectTickets.bind(this)}              
          > TICKETS
          </Button>
        </ButtonToolbar>  
        </div>               
      </div>
    );
  }
}

export default App;
