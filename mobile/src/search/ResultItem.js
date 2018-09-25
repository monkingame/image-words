import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, FlatList, Button, StyleSheet } from 'react-native';
// import domtoimage from 'dom-to-image';
import { compose, } from "react-apollo";
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

// import ImageApiServer from '../components/ImageApiServer';
import { ImageFromServerUrl } from '../components';
// import { copyImageSuccess } from '../export/actions';
// import { CopyImage } from '../export';
import { withMutImageLocalField } from '../graphql/WithMutation';
import { withMetadataQuery, } from '../graphql/WithQuery';
import { ButtonCommon, } from '../components/button';
import { BUTTON_TYPE_SHARE, } from '../components/button';
import { addJpegBase64Header } from '../util/BufferBase64';

class ResultItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // visible: false,
    };
  }

  onExportImage = () => {
    this.refs.viewShot.capture().then(async (uri) => {
      // console.log("准备导出图片: ", uri);
      // this.setState({ uri, visibleModalPreview: true });
      const puredata = await RNFS.readFile(uri, 'base64');
      const base64 = addJpegBase64Header(puredata);
      // const msg = this.props.exportWords || '分享标题';
      const shareFile = {
        // title: msg,
        // message: msg,
        url: base64,
        // subject: "链接分享" //  for email
      };
      Share.open(shareFile);
    })
  }


  render() {
    const { result, metadata } = this.props;
    if (!result || !metadata) return null;

    // console.log('ResultItem result: ', result);
    const { imageid, content } = result;

    return (
      <View style={styles.baseContainer}>
        <ViewShot
          style={{ flex: 6, alignSelf: 'center', }}
          ref="viewShot"
          options={{
            format: "jpg", quality: 0.9,
            // width: 300, height: 300,
          }}
        >
          <View style={styles.imageWordsContainer}>
            <ImageFromServerUrl
              id={imageid}
              metadata={metadata}
            />
            {/* TODO: 注意字体颜色！如果是黑色，那么会淹没在背景内 */}
            <Text style={styles.text}>{content}</Text>
          </View>
        </ViewShot >

        <View style={styles.mainButtonContainer} >
          <ButtonCommon type={BUTTON_TYPE_SHARE} text={'分享'} onPress={this.onExportImage} />
        </View>
      </View >
    );
  }
}


// export default ResultItemContainer;
export default compose(
  withMetadataQuery(),

  withMutImageLocalField('base64Copying'),
)(ResultItem);


const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#AABB33',
    borderRadius: 3,
    borderWidth: 1,
    marginVertical: 6,
    // backgroundColor: '#d0d1d0',
  },
  imageWordsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  mainButtonContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  text: {
    // color: '#3333ff',
    // backgroundColor: 'white',
    color: '#ffff33',
    backgroundColor: 'black',
  },
});
