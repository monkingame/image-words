import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { compose, } from "react-apollo";


import { stsSignatureUrl } from '../util/oss';
import { withImageQuery, withMetadataQuery } from '../graphql/WithQuery';


//TODO:deprecated
class ImageSignatureUrl extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = { signatureurl: '' };
  // }

  // componentDidMount() {
  //   const { token } = this.props;
  //   this.dispImage(token);
  // }

  // componentWillReceiveProps(nextProps) {
  //   const tokenOld = this.props.token;
  //   const tokenNext = nextProps.token;
  //   if ((tokenOld !== tokenNext) && tokenNext) {
  //     this.dispImage(tokenNext);
  //   }
  // }


  render() {
    // const { alt } = this.props;
    const { image, metadata } = this.props;
    if (!image || !metadata) return null;
    const url = stsSignatureUrl(metadata.ossToken, image.filename);

    return (
      <div>
        <img
          // src={this.state.signatureurl}
          src={url}
          // alt={alt}
          alt={`图片未知`}
          />
      </div>
    );
  }
}


// const mapStateToProps = (state) => {
//   return {
//     token: getStsToken(state),
//   };
// }

// const ImageSignatureUrlContainer = connect(
//   mapStateToProps
// )(ImageSignatureUrl)

// export default ImageSignatureUrlContainer;
export default compose(
  withMetadataQuery(),
  withImageQuery(),
)(ImageSignatureUrl);

