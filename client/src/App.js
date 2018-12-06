import React, { Component } from 'react';
import { broadcastUser, broadcastUsers, broadcastMessages } from './api';
import Messenger from './components/Messenger';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: 'none',
      users: [],
      msg: '',
      msgs: [],
      positions: []
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
        <header className="online">
          <h5>ONLINE <div className='icon'>{this.state.users.length - 1}</div></h5>
          {online.map( u => <div key={u}>{u}</div>)}
        </header>
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
