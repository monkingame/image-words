import React, { Component } from 'react';
import { compose, graphql, } from "react-apollo";
import { Text, View, Image, StyleSheet } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { getDimensionWidth, getDimensionHeight } from '../util/DimesionUtil';

import { withImageQuery } from '../graphql/WithQuery';
import { parseImageSizeString, } from '../util/ImageUtil';

class ZoomImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: null,
    };
  }

  onLayout = (nativeEvent) => {
    const { layout } = nativeEvent;
    // const { x, y, width, height } = layout;
    // console.log('ZoomImage onLayout : ', layout);
    this.setState({ layout });
  }

  caculateImageSize = () => {
    const { image } = this.props;
    if (!image) return null;
    const imageSize = parseImageSizeString(image.size);
    if (!imageSize) return null;
    const { width: imgWidth, height: imgHeight } = imageSize;
    const { layout } = this.state;
    if (!layout) return null;
    const { width: panelWidth, height: panelHeight } = layout;

    let ratio = 1;
    if (imgWidth <= panelWidth && imgHeight <= panelHeight) {
      ratio = 1;
    } else {
      ratio = Math.min(panelWidth / imgWidth, panelHeight / imgHeight);
    }
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    return { width, height, ratio };
  }


  render() {
    const { image } = this.props;
    if (!image) return null;

    const { layout } = this.state;
    const imgSize = this.caculateImageSize();

    return (
      <View
        onLayout={({ nativeEvent }) => this.onLayout(nativeEvent)}
        style={styles.container}>
        {
          (layout && imgSize) ?
            (<ImageZoom
              cropWidth={layout.width}
              cropHeight={layout.height}
              imageWidth={layout.width}
              imageHeight={layout.height}>

              <Image source={{ uri: image.base64Copying }}
                style={{
                  width: imgSize.width,
                  height: imgSize.height,
                }}
                resizeMode={'contain'}
                resizeMethod={'resize'}
              />
            </ImageZoom>) :
            null
        }

      </View>
    );
  }
}


export default compose(
  withImageQuery(),
)(ZoomImage);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
})

