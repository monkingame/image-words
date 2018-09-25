import React, { Component } from 'react';

import './image.css';
import SelectedWordsLabel from './SelectedWordsLabel'

import ImageSts from './ImageSts';
import ImageSignatureUrl from './ImageSignatureUrl';

// props id为image id
class OssImageWithWord extends Component {

  render() {
    const useSts = true;
    const { id } = this.props;

    return (
      <div className="img-sts-wrap">

        {
          useSts ?
            <ImageSts
              id={id}
              customStyle={"img-sts-self"}
            /> :
            <ImageSignatureUrl
              id={id}
              customStyle={"img-sts-self"}
            />
        }

        <SelectedWordsLabel
          id={id}
          customStyle={"shuoshuo-words"}
        />
      </div>
    );
  }
}

export default OssImageWithWord;
