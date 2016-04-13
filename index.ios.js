/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import { Socket } from './phoenix';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';

let socket = new Socket("ws://localhost:4000/socket")
socket.connect()
let channel  = socket.channel("rooms:lobby", {})


class chat extends Component {
  constructor(){
    super();

    this.state = {
      messages: [],
      message: ""
    }
  }

  componentWillMount(){
    channel.join()
      .receive("ok", resp => { this.renderMessages(resp.messages) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on("new_msg", payload => {
      let text = this.state.messages;
      text.push(payload.body)
      this.setState({messages: text});
    })
  }
  renderMessages(messages) {
    let messagesArray = [];
    messages.map(message => {
      messagesArray.push(message.body)
    });
    this.setState({messages: messagesArray});
  }
  onInput() {
    if(this.state.message.length > 0) {
      channel.push("new_msg", {body: `React Native: ${this.state.message}`})
      this.clearText()
      this.setState({message: ""})
    }
  }
  clearText() {
    this._textInput.setNativeProps({text: ''});
  }
  render() {
    return (
      <View style={styles.container}>
        <Messages messages={this.state.messages}/>
        <TextInput
          onChangeText={ (text)=> this.setState({message: text}) }
          ref={component => this._textInput = component}
          value={this.state.message}
          style={styles.input} placeholder="Input">
        </TextInput>

        <TouchableHighlight onPress={this.onInput.bind(this)} style={styles.button}>
          <Text style={styles.buttonText}>
            Send
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const Messages = (props) => {
  return (
    <View>
      {props.messages.map((message, i) => <Text style={styles.text} key={i}> {message} </Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
    padding: 10,
    paddingTop: 80
  },
  input: {
    height: 50,
    marginTop: 10,
    padding: 4,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48bbec'
  },
  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center',
  },
  text: {
    margin: 5,
    marginLeft: 0
  }
});

AppRegistry.registerComponent('chat', () => chat);
