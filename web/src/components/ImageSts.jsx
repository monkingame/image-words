import React, { Component } from 'react';
// import { compose, withApollo } from "react-apollo";
import { compose, } from "react-apollo";

import { getBase64OssFile } from '../util/oss';
// import { UpdateImageBase64 } from '../graphql/GQLQuery';
import { withImageQuery, withMetadataQuery } from '../graphql/WithQuery';
// import { withMutImageBase64 } from '../graphql/WithMutation';
import { withMutImageLocalField } from '../graphql/WithMutation';

import './image.css';

class ImageSts extends Component {

  //TODO:注意： react v17后，componentWillReceiveProps就不再支持了，及时升级
  async componentWillReceiveProps(nextProps) {
    // const { image, metadata, client, id, updateImageBase64 } = nextProps;
    const { image, metadata, id, updateImageLocalBase64, updateImageLocalSize } = nextProps;
    if (!image || !metadata) return;
    const { base64, size } = image;
    if (!base64) {
      const base64Url = await getBase64OssFile(metadata.ossToken, image.filename);
      // console.log('ImageSts componentWillReceiveProps : ', id, base64);
      //TODO:此处将被替换为新的resolver
      // UpdateImageBase64(client, id, data:base64);
      await updateImageLocalBase64({
        variables: {
          id,
          base64: base64Url,
        }
      });

      //计算图像物理像素
      const imgTest = new Image();
      imgTest.src = base64Url;
      // console.log('ImageSts componentWillReceiveProps : ', imgTest.naturalWidth, imgTest.naturalHeight);
      if (!size) {
        await updateImageLocalSize({
          variables: {
            id,
            //TODO:可用JSON.stringfy代替（如果只能String类型的话）
            size: {
              width: imgTest.naturalWidth,
              height: imgTest.naturalHeight,
              __typename: 'ImageSizeType',
            },
            // size: `${imgTest.naturalWidth}-${imgTest.naturalHeight}`,
          }
        });
      }
    }
  }

  // onImageLoad = ({ target: img }) => {
  //   // console.log('ImageSts onImgLoad: ', img.naturalWidth, img.naturalHeight);
  //   const { image, id, updateImageLocalSize } = this.props;
  //   // console.log('ImageSts onImgLoad: ', image, id, updateImageLocalSize);
  //   // console.log('ImageSts onImgLoad: ', this.props);
  //   if (!image) return;
  //   const { size } = image;
  //   if (!size) {
  //     updateImageLocalSize({
  //       variables: {
  //         id,
  //         size: {
  //           width: img.naturalWidth,
  //           height: img.naturalHeight,
  //           __typename: 'ImageSizeType',
  //         },
  //       }
  //     });
  //   }
  // }

  render() {
    const { image } = this.props;
    if (!image) return null;
    const { base64 } = image;
    if (!base64) return null;
    // console.log('ImageSts image: ', image);
    // const { size } = image;
    // if (size) console.log('ImageSts image: ', image);

    return (
      <img
        src={base64}
        alt={"未知图片"}
        className={this.props.customStyle}
        // onLoad={this.onImageLoad}
      />
    );
  }
}


export default compose(
  // withApollo,
  withMetadataQuery(),
  withImageQuery(),
  // withMutImageBase64(),
  withMutImageLocalField('base64'),
  withMutImageLocalField('size','ImageSizeType'),
)(ImageSts);

