import React, { Component } from 'react';
import { View, StyleSheet, Text, } from 'react-native';
import Modal from "react-native-modal";
const _ = require('lodash');

import { ButtonCommon, } from './button';
import { BUTTON_TYPE_CLOSE, } from './button';

// 对 react-native-modal 的扩展
class ExtDialog extends Component {
  render() {
    const { visible, handleClose, title } = this.props;

    return (
      <Modal
        isVisible={visible}
        onBackButtonPress={handleClose}
        onBackdropPress={handleClose}
      >
        <View style={styles.main}>
          <View style={styles.titleBar}>
            <View style={{
              flex: 5,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {
                title ?
                  <Text style={{ color: 'darkblue' }}>{title}</Text> :
                  null
              }
            </View>
            <View style={{ flex: 1, }}>
              <ButtonCommon
                type={BUTTON_TYPE_CLOSE}
                onPress={handleClose}
              />
            </View>
          </View>

          <View style={styles.child}>
            {this.props.children}
          </View>
        </View>
      </Modal>
    );
  }
}

export default ExtDialog;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    // borderWidth: 3,
    // borderColor: 'green',
    borderRadius: 3,
  },
  child: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
  titleBar: {
    alignItems: 'center',
    justifyContent: 'center',
    // flex: 1,
    // marginTop: 20,
    flexDirection: 'row',
    // alignItems: 'flex-end',
    height: 30,
    // marginHorizontal: 10,
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
})

