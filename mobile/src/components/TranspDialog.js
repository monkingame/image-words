import React, { Component } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, } from 'react-native';
const _ = require('lodash');

import { ButtonCommon, } from './button';
import { BUTTON_TYPE_CLOSE, } from './button';
import { HEIGHT_TOP_STATUS_BAR } from '../util/DimesionUtil';

class TranspDialog extends Component {
  render() {
    const { visible, handleClose,
      transBkgndColor = 'rgba(157,157,157,0.7)',//'#9D9D9DBB' 或 'rgba(157,157,157,0.8)'
    } = this.props;
    let { scaleContent } = this.props;

    // TODO: 可以再考虑透明背景平均分布在头尾，或者居上/居下
    if (!scaleContent || _.isNaN(scaleContent)) scaleContent = 1;
    if (scaleContent < 0) scaleContent = 0;
    if (scaleContent > 1) scaleContent = 1;
    let scaleHead = Math.round((1 - scaleContent) * 100);
    let scaleBody = Math.round(scaleContent * 100);
    // console.log('TranspDialog scale: ', scaleHead, scaleBody);

    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType={'slide'}
        onRequestClose={handleClose}
      >
        {/* 点击对话框外部关闭：其实这个外部仍然还是对话框内部，但因为用了透明灰色，看起来像是加了遮罩一样 */}
        <View style={[styles.head, {
          flex: scaleHead,
          backgroundColor: transBkgndColor,
          // marginTop: HEIGHT_TOP_STATUS_BAR,
        }]} >
          <TouchableOpacity
            style={{ flex: 1, }}
            activeOpacity={1}
            onPressOut={handleClose}
          />
        </View>

        <View style={[styles.body, {
          flex: scaleBody,
          // backgroundColor: '#EFEFEF',
        }]}>

          <View style={styles.close}>
            <ButtonCommon
              type={BUTTON_TYPE_CLOSE}
              onPress={handleClose}
              // text='关闭'
            />
          </View>

          <View style={styles.child}>
            {this.props.children}
          </View>

        </View>
      </Modal>
    );
  }
}

export default TranspDialog;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  head: {
    marginTop: HEIGHT_TOP_STATUS_BAR,
    // borderWidth: 1,
    // borderColor: 'green',
    // borderRadius: 3,
  },
  body: {
    backgroundColor: '#EFEFEF',
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
  child: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
  close: {
    // flex: 1,
    // marginTop: 20,
    alignItems: 'flex-end',
    height: 40,
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
})

