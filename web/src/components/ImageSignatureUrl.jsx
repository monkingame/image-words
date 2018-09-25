import React, { Component } from 'react';
import { compose, } from "react-apollo";

import { stsSignatureUrl } from '../util/oss';
import { withImageQuery, withMetadataQuery } from '../graphql/WithQuery';


class ImageSignatureUrl extends Component {

  render() {
    const { image, metadata } = this.props;
    if (!image || !metadata) return null;
    const url = stsSignatureUrl(metadata.ossToken, image.filename);

    return (
      <div>
        <img
          src={url}
          alt={`图片未知`}
          className={this.props.customStyle}
        />
      </div>
    );
  }
}

export default compose(
  withMetadataQuery(),
  withImageQuery(),
)(ImageSignatureUrl);

