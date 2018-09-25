import React, { Component } from 'react';
import { compose, } from "react-apollo";

import './export.css';
import { withImageQuery, } from '../graphql/WithQuery';

class CopyImage extends Component {

  render() {
    const { image } = this.props;
    if (!image) return null;

    return (
      <div className="img-copy-wrap">
        <img
          src={image.base64Copying}
          alt={`未知图片`}
          className="img-copy-self"
        />
      </div>
    );
  }
}


export default compose(
  withImageQuery(),
)(CopyImage);

