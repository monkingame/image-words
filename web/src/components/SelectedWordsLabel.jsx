import React, { Component } from 'react';
import { compose } from "react-apollo";

import { withImageQuery, } from '../graphql/WithQuery';

class SelectedWordsLabel extends Component {
  render() {
    const { image } = this.props;
    if (!image) return null;

    return (
      <div className={this.props.customStyle} >
        {image.selectedWord}
      </div>
    );
  }
}


export default compose(
  withImageQuery(),
)(SelectedWordsLabel);

