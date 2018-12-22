import React, { Component } from 'react';
import { submitMessage } from '../api';

export default class Messenger extends Component {
    render() {
        let today = new Date().toUTCString()
        return (
            <div>
                <h5>Welcome: <span>{this.props.user}</span></h5>
                <form onSubmit={e => this.props.msg === '' ?
                    e.preventDefault() :
                    submitMessage(e, { msg: this.props.msg, user: this.props.user, stamp: today })}>
                    <input id='message' className='form-control' type='text'
                        onChange={this.props.updateMsg} value={this.props.msg} 
                        placeholder='Chat with other players' />
                    <button id='submit' className='btn btn-default' type='submit'
                        onClick={this.props.submitMsg}>Send</button>
                </form>
                <div id='messages'>{this.props.msgs.map(m =>
                    <p className='msg'>
                        <code className={m.user === this.props.user ? 'myMsg' : ''}>{m.user}:</code>
                        {` ${m.msg}`}<caption>{m.stamp}</caption></p>)}
                </div>
            </div>
        )
    }
}
