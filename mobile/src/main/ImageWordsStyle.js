
import React, { Component, PureComponent, } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, Text, } from 'react-native';

import {
  HEIGHT_TOP_STATUS_BAR, HEIGHT_TOP_CTRL_BAR, HEIGHT_BOTTOM_TAB_BAR,
  WIDTH_CHILD, HEIGHT_CHILD, MARGIN_CHILD, LEFT_CHILD, TOP_CHILD,
  HEIGHT_WORD_LABEL,
} from '../util/DimesionUtil';


const WIDTH_CONTAINER = WIDTH_CHILD;
const HEIGHT_CONTAINER = HEIGHT_CHILD;

const HEIGHT_IMAGE_AND_LABEL = HEIGHT_CONTAINER / 2 + HEIGHT_WORD_LABEL;
const HEIGHT_CTRL_BAR = 40;
const HEIGHT_NEW_WORD = 40;
const HEIGHT_BUTTON_FULL_LISTWORDS = 40;
const HEIGHT_LIST_WORDS = HEIGHT_CONTAINER
  - HEIGHT_IMAGE_AND_LABEL - HEIGHT_CTRL_BAR - HEIGHT_NEW_WORD - HEIGHT_BUTTON_FULL_LISTWORDS;


export default styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#DBDBDBCC',
    borderBottomWidth: 1,
    // borderTopColor: 'red',
    // borderRadius: 10,
    // borderWidth: 1,
    width: WIDTH_CONTAINER,
    height: HEIGHT_CONTAINER,
    // backgroundColor: genRandomColor(),
  },
  imageWithLabel: {
    // flex: 6,
    alignItems: 'center',
    justifyContent: 'center',
    // alignSelf: 'center',
    // borderColor: 'black',
    // borderRadius: 10,
    // borderWidth: 1,
    left: 0,
    top: 0,
    width: WIDTH_CONTAINER,
    height: HEIGHT_IMAGE_AND_LABEL,
  },
  viewShot: {
    flex: 1,
    // alignSelf: 'center',
    // borderColor: 'blue',
    // borderRadius: 10,
    // borderWidth: 2,
    // left: 0,
    // top: 0,
    // width: WIDTH_CHILD,
    // height: HEIGHT_CHILD,
  },
  // modalContainer: {
  //   flex: 1,
  //   alignItems: 'center',
  // },
  // innerContainer: {
  //   alignItems: 'center',
  // },
  ctrlBar: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
    height: HEIGHT_CTRL_BAR,
  },

  ctrlFunctionBar: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: HEIGHT_CTRL_BAR,
  },
  ctrlMoreBar: {
    // flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: HEIGHT_CTRL_BAR,
    // backgroundColor: 'honeydew',
    // borderWidth: 2,
  },

  // ctrlBar: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   borderColor: '#AABBCC',
  //   marginHorizontal: 20,
  //   marginBottom: 1,
  //   height: 40,
  //   borderStyle: 'dotted',
  // },
  // ctrlBarNoBottom: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   borderColor: '#AABBCC',
  //   marginHorizontal: 20,
  //   marginBottom: 0,
  //   height: 40,
  //   borderStyle: 'dotted',
  // },
  // assitBar: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   borderColor: '#AABBCC',
  //   marginHorizontal: 20,
  //   marginBottom: 1,
  //   height: 40,
  //   borderStyle: 'dotted',
  // },
  // modalWords: {
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  buttonContainer: {
    marginHorizontal: 12,
  },
  // mainButtonContainer: {
  //   marginHorizontal: 20,
  // },
  // assitButtonContainer: {
  //   marginHorizontal: 20,
  // },
  blockContainer: {
    marginVertical: 10,
    backgroundColor: '#BBBBBB',
    height: 50,
  },
  simpleListWords: {
    width: WIDTH_CONTAINER,
    height: HEIGHT_LIST_WORDS,
    borderWidth: 1,
    borderColor: '#AABB33',
    borderRadius: 10,
  },
  buttonFullListWords: {
    width: WIDTH_CONTAINER,
    height: HEIGHT_BUTTON_FULL_LISTWORDS,
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
    // TODO: 去掉了simpleListWords 因此将margin vertical提高 填充垂直空间
    marginVertical: 20,
  },
  newWord: {
    alignItems: 'center',
    justifyContent: 'center',
    width: WIDTH_CONTAINER,
    height: HEIGHT_NEW_WORD,
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
});

