import React, { Component } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { compose, graphql, } from "react-apollo";

// import './image.css';
import SelectedWordsLabel from './SelectedWordsLabel'

// import ImageSts from './ImageSts';
// import ImageSignatureUrl from './ImageSignatureUrl';

import ImageFromServerUrl from './ImageFromServerUrl';
import { withMetadataQuery, } from '../graphql/WithQuery';

import {
  WIDTH_CHILD, HEIGHT_CHILD, HEIGHT_WORD_LABEL,
} from '../util/DimesionUtil';

// props id为image id
class OssImageWithWord extends Component {


  render() {
    // const useSts = false;
    const { id, metadata } = this.props;
    if (!metadata) return null;

    // const { layoutLabel, layoutImage } = this.state;
    // console.log('OssImageWithWord layout: ', layoutLabel, layoutImage, );

    return (
      <View style={styles.container}>
        <View style={styles.image}>
          <ImageFromServerUrl
            id={id}
            metadata={metadata}
          />
        </View>

        <View style={[styles.label,
          // { width: layoutLabel.width, height: layoutLabel.height },
        ]}>
          <SelectedWordsLabel
            id={id}
            metadata={metadata}
          // onLayout={(layout) => this.onLabelLayout(layout)}
          />
        </View>

      </View>
    );
  }
}

// export default OssImageWithWord;
export default compose(
  withMetadataQuery(),
)(OssImageWithWord);


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'center',
    // borderWidth: 1,
    // borderColor: 'green',
    // borderRadius: 10,
    // left: 0,
    // top: 0,
    // width: WIDTH_CHILD,
    height: HEIGHT_CHILD / 2 + HEIGHT_WORD_LABEL,
  },
  image: {
    // flex: 10,
    // left: 0,
    // width: WIDTH_CHILD-100,
    height: HEIGHT_CHILD / 2,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 13,
  },
  label: {
    // flex: 1,
    // width: WIDTH_CHILD,
    height: HEIGHT_WORD_LABEL,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 3,
  },
});

