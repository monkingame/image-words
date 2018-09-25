//这个将取代其他各Button类 便于管理

import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import SimpleIconLine from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


//props: onPress,text,type
class BackToTop extends Component {
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
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={this._onPress}>
          <SimpleIconLine size={36} name="arrow-up-circle" color={'#777788'} />
          {/* <MaterialCommunityIcons size={36} name="arrow-collapse-up" color={'#777788'} /> */}
        </TouchableOpacity>

      </View>
    );
  }
}

export default BackToTop;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF00',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})

