import React, { Component } from 'react';
import { broadcastUser, broadcastUsers, broadcastMessages, joinGame, startGame, stopGame } from './api';
import Messenger from './components/Messenger';
import { createGame } from './engine';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: 'none',
      users: [],
      msg: '',
      msgs: [],
      isStart: false
    }
    broadcastUser((user) => this.setState({
      userID: user
    }));
    broadcastUsers((users) => this.setState({
      users: users
    }));
    broadcastMessages(msgs => this.setState({
      msgs: msgs
    }))
    startGame(isStart => this.setState({
      isStart: isStart
    }))
    stopGame(isStart => this.setState({
      isStart: isStart
    }))
  }
  updateMsg = e => {
    this.setState({
      msg: e.target.value
    })
  }
  submitMsg = () => {
    setTimeout(() => this.setState({
      msg: ''
    }), 50);
  }
  render() {
    const { userID, users } = this.state;
    var online = users.filter(u => u !== userID);
    return (
      <div className="App">
      {!this.state.isStart ?
      <div id='btn' className='row'><div className='col-sm'><button className='btn btn-warning btn-block' onClick={_ => joinGame()}>Join Game</button></div>
      <div className='col-sm'><button className='btn btn-default btn-block' onClick={createGame}>Solo Game</button></div></div> :
      <div id='in-progress' className='text-center'><code>Game in Progress</code></div>}
      <div id='headers'>
      <div className='row'>
        <div className="online col-sm">
          <h5>ONLINE <div className='icon'>{this.state.users.length - 1}</div></h5>
          {online.map( u => <div key={u}>{u}</div>)}
        </div>
        <div className="online col-sm">
          <h5>High Score: </h5>
          <ol>
            <li>drowsy-nickname: 86798334</li>
            <li>chemical-question: 76394852</li>
            <li>galactic-neuron: 49879872</li>
            <li>bizarre-sculpture: 287329823</li>
            <li>cleared-roundness: 278798743</li>
          </ol>
        </div>
        </div>
</div>
        <Messenger msg={this.state.msg}
        msgs={this.state.msgs}
        updateMsg={this.updateMsg}
        submitMsg={this.submitMsg}
        user={this.state.userID} />
      </div>
    );
  }
}

export default App;
export { startGame, stopGame };