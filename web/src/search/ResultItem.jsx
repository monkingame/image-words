import React, { Component } from 'react';
// import { connect } from 'react-redux';
import ImageSts from '../components/ImageSts';
import domtoimage from 'dom-to-image';
import { findDOMNode } from 'react-dom';
import { Button, Row, Col, Icon, Modal } from 'antd';
import { compose, } from "react-apollo";
import 'antd/dist/antd.css';

import './search.css'
// import { copyImageSuccess } from '../export/actions';
import { CopyImage } from '../export';
import { withMutImageLocalField } from '../graphql/WithMutation';

class ResultItem extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, };
  }

  downloadImage = () => {
    const { result } = this.props;
    if (!result) return;
    if (!this.divContent) return;

    domtoimage.toJpeg(findDOMNode(this.divContent), { quality: 0.80, bgcolor: "#fff" })
      .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = result.content + ".jpg";
        link.href = dataUrl;
        link.click();
      });
  }

  copyImage = () => {
    if (!this.divContent) return;
    //NOTE:注意此处的回调函数，this环境又被改变了，需要保存
    const that = this;
    domtoimage.toJpeg(findDOMNode(this.divContent), { quality: 0.80, bgcolor: "#fff" })
      .then(function (base64Copying) {
        const { result, updateImageLocalBase64Copying } = that.props;
        // console.log('ResultItem copyImage: ', result);
        if (result) {
          // const { image } = result;
          // if (image) {
          updateImageLocalBase64Copying({
            variables: {
              id: result.imageid,
              base64Copying,
            }
          });
          // }
        }
      });

    this.setState({ visible: true, });
  }

  handleCancel = () => {
    this.setState({ visible: false, });
  }

  render() {
    const { result } = this.props;
    if (!result) return null;
    // console.log('ResultItem result: ', result);
    // const { image } = result;
    // if (!image) return null;
    const { imageid } = result;

    return (
      <div>
        <Row>
          <Col span={16} offset={4}>
            <Row>
              <div ref={(div) => { this.divContent = div }} className="search-img-sts-wrap">
                <ImageSts id={imageid} customStyle={"search-img-sts-self"} />
                <div className="search-shuoshuo-words" >{result.content}</div>
              </div>
            </Row>

            <Row>
              <Col span={6} >
                <Button onClick={this.downloadImage}> <Icon type="download" /> {"保存"}
                </Button>
              </Col>
              <Col span={6} >
                <Button icon="copy" onClick={this.copyImage}>{"复制"}</Button>

                <Modal title="请点击右键复制图片"
                  visible={this.state.visible}
                  width="700px"
                  onCancel={this.handleCancel}
                  footer={[
                    <Button key="back" size="large" onClick={this.handleCancel}>{"关闭"}</Button>,
                  ]}
                >
                  <CopyImage id={imageid} />
                </Modal>

              </Col>
            </Row>
          </Col>

        </Row>
      </div>
    );
  }
}


export default compose(
  withMutImageLocalField('base64Copying'),
)(ResultItem);

