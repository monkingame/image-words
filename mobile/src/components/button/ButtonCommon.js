//这个将取代其他各Button类 便于管理

import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { RenderIcon } from './ButtonTypeSelect';
import { FONT_SIZE } from './ButtonConst';


//props: onPress,text,type
class ButtonCommon extends Component {
  constructor(props) {
    super(props);
  }

  _onPress = () => {
    const { onPress } = this.props;
    if (onPress) {
      onPress();
    }
  }

  render() {
    const { disabled, type, status, color, text, size } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={this._onPress}
          // disabled={this.props.disabled}
          disabled={disabled}
        >
          {/* {RenderIcon(this.props.type, this.props.status)} */}
          {/* {RenderIcon({
            type: this.props.type,
            status: this.props.status,
            color: this.props.color,
          })} */}
          {RenderIcon({
            type,
            status,
            color,
            size,
          })}

          {
            text ?
              <Text style={{ fontSize: size, color }}>{this.props.text}</Text> :
              null
          }

        </TouchableOpacity>

      </View>
    );
  }
}

export default ButtonCommon;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // color: 'red',
    // flexDirection: 'row',
    // paddingHorizontal: 10
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    // backgroundColor: '#DDDDDD',
    // padding: 10
  },
})

