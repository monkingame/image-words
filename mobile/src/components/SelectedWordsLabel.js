import React, { Component } from 'react';
import { compose, graphql, } from "react-apollo";
import { Text, View, Platform, StyleSheet } from 'react-native';

import { withImageQuery } from '../graphql/WithQuery';
import StyleLabel from './SelectedWordsLabelStyle';

class SelectedWordsLabel extends Component {

  render() {
    const { image } = this.props;
    if (!image) return null;

    return (
      <View style={styles.container}>
        <Text
          // style={(Platform.OS === 'android') ? styles.textAndroid : styles.textIos}>
          style={StyleLabel.label}>
          {image.selectedWord}
        </Text>
      </View>
    );
  }
}


export default compose(
  withImageQuery(),
)(SelectedWordsLabel);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'green',
    // alignItems: 'center',
    // width: 300,
    height: 20,
  },
  // textAndroid: {
  //   color: '#ffff33',
  //   backgroundColor: 'black',
  // },
  // // @2018-06-26 21:37:27 ViewShot在iOS下是白色底，而在Android下是黑色底，加以区分
  // textIos: {
  //   color: '#000099',
  //   backgroundColor: 'white',
  // },
})


