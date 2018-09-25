//从API Server获取oss文件
import React, { Component } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { compose, graphql, withApollo, } from "react-apollo";
import RNFetchBlob from 'react-native-fetch-blob';

import {
  // getDimensionWidth, getDimensionHeight,
  WIDTH_CHILD, HEIGHT_CHILD,
} from '../util/DimesionUtil';
import { withImageQuery } from '../graphql/WithQuery';
import { QUERY_IMAGE, } from '../graphql/GQLQuery';
import { withMutImageLocalField } from '../graphql/WithMutation';
import { getBase64Header } from '../util/BufferBase64';
import { stringifyImageSize, } from '../util/ImageUtil';
import { getInputOssTokenByMetadata } from '../graphql/GQLTypes';


class ImageFromServerUrl extends Component {

  constructor(props) {
    super(props);
    this.state = {
      width: WIDTH_CHILD - 10,
      height: HEIGHT_CHILD / 2,
      loaded: false,
      base64Uri: '',
    };
  }


  // @2018-06-08 14:09:23
  // 从服务器拉取图像
  pullImageFromServer = async () => {
    const { client, metadata, id, updateImageLocalBase64, updateImageLocalSize } = this.props;
    // console.log('ImageFromServerUrl pullImageFromServer: ', metadata, id);

    if (!client || !metadata) return;
    // const { ossToken } = metadata;
    // if (!ossToken) return;

    // // 此处的ossToken包含__typename等属性，不能作为纯粹的InputOssTokenType传递，会出错
    // const { accessKeyId, accessKeySecret, stsToken, region, bucket, secure } = ossToken;

    // graphql读取
    const { data } = await client.query({
      query: QUERY_IMAGE,
      variables: {
        id,
        // ossToken: { accessKeyId, accessKeySecret, stsToken, region, bucket, secure },
        ossToken: getInputOssTokenByMetadata(metadata),
        userToken: null,
      },
    });

    if (!data) return;
    const { image } = data;
    if (!image) return;
    // console.log('ImageFromServerUrl pullImageFromServer: ', image);

    const { signedUrl } = image;

    let { base64 } = image;
    if (!base64) {
      // console.log('ImageFromServerUrl pullImageFromServer: ', signedUrl);

      const res = await RNFetchBlob.fetch('GET', signedUrl);
      if (!res || (res.info().status !== 200)) return;
      // if (res.info().status !== 200) return;
      base64 = getBase64Header(image.filename) + res.base64();
    }

    // 更新本地image的base64缓存
    await updateImageLocalBase64({
      variables: {
        id,
        base64,
      }
    });

    this.setState({ base64Uri: base64, });

    // 计算图像尺寸
    Image.getSize(base64, async (imgWidth, imgHeight) => {
      // 根据图像尺寸调整边框
      const caculatedSize = this.recaculateImageContainer(imgWidth, imgHeight);

      // TODO: @2018-07-26 15:20:41
      // 此处直接把size改为了【宽*高】(string类型)，
      // 如果是ImageSizeType 总会出现奇怪的
      // [Network error]: Error: Encountered a sub-selection on the query, but the store doesn't have an object reference. 
      // 无解，于是就换成String类型，问题暂时解决
      // 有使用此处size的 都要修改
      await updateImageLocalSize({
        variables: {
          id,
          // size: stringifyImageSize(imgWidth, imgHeight),
          size: stringifyImageSize({
            width: imgWidth,
            height: imgHeight,
            ratio: caculatedSize.ratio,
          }),
        }
      });

      // console.log('pullImageFromServer updateImageLocalSize id: ', imgWidth, imgHeight);

      // 完成标志置位，可以加载了
      this.setState({ loaded: true, });
    });
  }

  async componentDidMount() {
    // console.log('ImageFromServerUrl componentDidMount');
    // this.setState({ loaded: true, });

    try {
      await this.pullImageFromServer();
    } catch (e) {
      console.error('获取图像发生错误: ', e.message);
      // console.log('ImageFromServerUrl pullImageFromServer error: ', e);
    }
  }


  // @2018-06-08 14:12:10
  // 重新计算图像边框 调整为合适尺寸
  // 比屏幕一半小的 就按照实际尺寸显示；否则进行等比例缩放
  recaculateImageContainer = (imgWidth, imgHeight) => {
    const maxWidth = WIDTH_CHILD - 10;
    const maxHeight = HEIGHT_CHILD * 1 / 2;//TODO:最大尺寸比例需要调整为合适值

    // console.log('ImageFromServerUrl WIDTH_CHILD HEIGHT_CHILD: ', WIDTH_CHILD, HEIGHT_CHILD);
    // console.log('ImageFromServerUrl onImageLoaded getSize: ', imgWidth, imgHeight);

    let ratio = 1;
    if (imgWidth <= maxWidth && imgHeight <= maxHeight) {
      // this.setState({ width: imgWidth, height: imgHeight });
      ratio = 1;
    } else {
      // const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      // this.setState({ width: imgWidth * ratio, height: imgHeight * ratio });
      ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    }
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    // this.setState({ width: imgWidth * ratio, height: imgHeight * ratio });
    this.setState({ width, height });

    return { width, height, ratio };
  }

  // @2018-08-10 13:36:05 根据外部给出的强制最大尺寸，计算合适的缩放比率
  cacuMaxSizeRatio = (maxSize, actualSize) => {
    if (!maxSize) return 1;
    const { width: maxWidth, height: maxHeight } = maxSize;
    if (!maxWidth || !maxHeight) return 1;
    const { width: actWidth, height: actHeight } = actualSize;
    // 高度/宽度 实际图像的高宽比
    const imgActRatio = actHeight / actWidth;
    // 高度/宽度 外部要求最大尺寸的高宽比
    const imgMaxRatio = maxHeight / maxWidth;
    let ratio = 1;
    if (imgMaxRatio > imgActRatio) {
      // 说明外部给出的尺寸太瘦了 应该以外部尺寸的宽度为准
      ratio = maxWidth / actWidth;
    } else {
      // 说明外部给出的尺寸太胖了 应该以外部尺寸的高度为准
      ratio = maxHeight / actHeight;
    }
    return ratio;
  }


  render() {
    // NOTE:resizeMethod={'resize'}
    // https://github.com/facebook/react-native/issues/10470

    // 新代码：从服务器拉取图像后，获取base64，计算尺寸，并更新
    const { loaded, base64Uri, width, height, } = this.state;
    // console.log('ImageFromServerUrl width height: ', width, height, );

    const ratio = this.cacuMaxSizeRatio(this.props.maxSize, { width, height });

    // console.log('ImageFromServerUrl render loaded: ', this.props.id, loaded, );
    // @2018-06-26 21:52:43 加载进度条
    if (!loaded) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    // console.log('ImageFromServerUrl render uri: ', base64Uri);

    return (
      <View style={[
        styles.container,
        {
          width: width * ratio,
          height: height * ratio,
          // left: (WIDTH_CHILD - width) / 2, top: 0,// TODO: 已经居中 再设置left就是错误！
        },
      ]}
      >
        <Image source={{ uri: base64Uri }}
          // onLoad={this.onImageLoaded}
          style={{
            width: width * ratio,
            height: height * ratio,
          }}
        // resizeMode={'contain'}
        // resizeMethod={'resize'}
        />
      </View>
    );
  }
}


export default compose(
  withApollo,
  // withImageQuery(),
  withMutImageLocalField('base64'),
  withMutImageLocalField('size', ),
)(ImageFromServerUrl);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: 'blue',
    // borderRadius: 23,
    // width: WIDTH_CHILD,
    // height: HEIGHT_CHILD / 2,
  },
});

