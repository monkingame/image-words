import React, { Component } from 'react';
import { compose, } from "react-apollo";

import { Icon } from 'antd';
import 'antd/dist/antd.css';
import { withImageQuery, } from '../graphql/WithQuery';

class ImageVoteCount extends Component {
  render() {
    const { image } = this.props;
    if (!image) return null;

    return (
      <div>
        {"赞"}
        <Icon type="trophy" />
        {image.vote}
      </div>
    );
  }
}


export default compose(
  withImageQuery(),
)(ImageVoteCount);
