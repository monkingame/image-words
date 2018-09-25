import React, { Component } from 'react';
// import { connect } from 'react-redux';

// import { getStsToken } from '../sts/Util';
import { stsGetFile } from '../sts/OssUtil';
// import { putImageCache } from './actions';
// import { REDUCER_IMAGE_CACHE } from './reducer';
// import { getMapImageFileName } from './Util';

// import './image.css';

//NOTE:这个组件自包含一套获取数据的流程，属于强耦合，从设计上并不美观。
//如果能在postRefreshWordsList获取wordlist后，进行cache设置是最好的。
//但refresh时，STS token可能还没取回，如果此时去refresh获取并设置cache，
//由于refresh就执行一次（除非用户手动刷新或执行页面），很可能再也收不到oss的image数据了。
//因此，在此组件内部，自包含获取和设置cache系统，是确保token能够得到。
//TODO:deprecated
class ImageSts extends Component {
  constructor(props) {
    super(props);
    this.state = { base64: '' };
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    const { token } = this.props;
    this.cacheStsFile(token);
    this.dispCacheImage();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    const tokenOld = this.props.token;
    const tokenNext = nextProps.token;
    if (tokenOld !== tokenNext) {
      this.cacheStsFile(tokenNext);
    }

    const cacheOld = this.props.cache;
    const cacheNext = nextProps.cache;
    if (cacheOld !== cacheNext) {
      this.dispCacheImage();
    }
  }

  cacheStsFile = (token) => {
    if (!token) return;

    const { filename, base64, putCache } = this.props;
    if (base64) {
      return;
    }

    const that = this;
    stsGetFile(token, filename,
      function (base64) {
        putCache(filename, base64);
        if (that.mounted) {
          that.setState({ base64 });
        }
      },
      function (err) {
      });
  }

  dispCacheImage = () => {
    const { base64 } = this.props;
    if (this.mounted) {
      this.setState({ base64 });
    }
  }

  render() {
    const { base64 } = this.state;
    if (!base64) return null;

    //NOTE:组件强耦合了，需要解耦
    //TODO:alt值应该单独处理一下
    return (
      <img src={base64} alt={""} className={this.props.customStyle} />
    );
  }
}


// const mapStateToProps = (state, ownProprs) => {
//   const cache = state[REDUCER_IMAGE_CACHE];
//   const { _id } = ownProprs;
//   const filename = getMapImageFileName(state, _id);
//   return {
//     token: getStsToken(state),
//     base64: cache[filename],
//     filename,
//   };
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     putCache: (filename, base64) => {
//       dispatch(putImageCache(filename, base64));
//     }
//   }
// }

// const ImageStsContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(ImageSts)

// export default ImageStsContainer;
export default ImageSts;

