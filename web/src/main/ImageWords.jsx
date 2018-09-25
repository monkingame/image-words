import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import domtoimage from 'dom-to-image';
import { Row, Col, Button, Modal, message, Menu, Dropdown, } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";

import './main.css';
import OssImageWithWord from '../components/OssImageWithWord';
import { ImageVoteCount, DeleteImage } from '../image/';
import { ListWords, NewWords, } from '../word';
import { CopyImage, ExportImageButton } from '../export';
import { withLocalLoginedUserQuery, } from '../graphql/WithQuery';
import { withMutImageLocalField } from '../graphql/WithMutation';
import Report from './Report';
import { QUEREY_BLOCK, } from '../graphql/GQLQuery';
import { MUT_SWITCH_BLOCK, } from '../graphql/GQLMutation';

const _ = require('lodash');

class ImageWords extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visibleCopyModal: false,
      visibleReport: false,
      // block: false,
    };
  }

  // fetchBlock = async () => {
  //   const { client, id, loginedUser } = this.props;
  //   if (!client || !id) return;

  //   if (loginedUser) {
  //     const { data } = await client.query({
  //       query: QUEREY_BLOCK,
  //       variables: {
  //         userToken: loginedUser.token,
  //         banid: id,
  //       },
  //     });
  //     const { block } = data;
  //     this.setState({ block });
  //   } else {
  //     this.setState({ block: false });
  //   }
  // }

  // async componentDidMount() {
  //   // const { id, loginedUser } = this.props;
  //   // console.log('ImageWords componentDidMount : ', loginedUser);
  //   this.fetchBlock();
  // }

  // // 感觉页面加载速度变慢了 难道是await原因？
  // async componentWillReceiveProps(nextProps) {
  //   const { client, id } = this.props;
  //   const { loginedUser } = nextProps;
  //   if (!loginedUser || !client || !id) {
  //     this.setState({ block: false });
  //     // console.log('ImageWords componentWillReceiveProps : ', block);
  //     return;
  //   };
  //   const { data } = await client.query({
  //     query: QUEREY_BLOCK,
  //     variables: {
  //       userToken: loginedUser.token,
  //       banid: id,
  //     },
  //   });
  //   const { block } = data;
  //   // console.log('ImageWords componentWillReceiveProps : ', block);
  //   this.setState({ block });
  // }

  downloadImage = (filename) => {
    if (!this.divContent) return;
    domtoimage.toJpeg(findDOMNode(this.divContent), { quality: 0.80, bgcolor: "#fff" })
      .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      });
  }

  onCopyImage = () => {
    if (!this.divContent) return;
    //NOTE:注意此处的回调函数，this环境又被改变了，需要保存
    const that = this;
    // console.log('ImageWords copyImage dataUrl divContent: ', findDOMNode(this.divContent));

    domtoimage.toJpeg(findDOMNode(this.divContent),
      { quality: 0.80, bgcolor: "#fff" })
      .then(function (base64Copying) {
        // const { client, id, updateImageBase64Copy } = that.props;
        // const { id, updateImageBase64Copy } = that.props;
        const { id, updateImageLocalBase64Copying } = that.props;
        // UpdateCopyingImageBase64(client, id, base64Copying);
        //TODO:此处将被替换为新的resolver
        updateImageLocalBase64Copying({
          variables: {
            id,
            base64Copying,
          }
        });
      });

    this.setState({ visibleCopyModal: true, });
  }

  closeCopyModal = () => {
    this.setState({ visibleCopyModal: false, });
  }

  onReport = () => {
    const { loginedUser, } = this.props;
    if (!loginedUser) {
      message.error('请先登录');
      return;
    }
    this.setState({ visibleReport: true, });
  }

  closeReportModal = () => {
    this.setState({ visibleReport: false, });
  }

  moreDropdownMenu = () => {
    const { id } = this.props;

    return (
      <Menu
      // onClick={this.handleMoreMenuClick}
      >
        {/* 删除图像 */}
        <Menu.Item key="1">
          <DeleteImage id={id} />
        </Menu.Item>

        {/* 举报图像 */}
        <Menu.Item key="2">
          <Button icon="notification" onClick={this.onReport}>{"举报"}</Button>
        </Menu.Item>

        {/* 屏蔽 */}
        <Menu.Item key="3">
          {/* <Button icon="close-circle-o" onClick={this.onBlockItem}>{"屏蔽"}</Button> */}
          <Button icon="close-circle-o"
            onClick={async () => this.switchBlockStatus(true)} >{"屏蔽"}</Button>
        </Menu.Item>
      </Menu>
    )
  };

  // onBlockItem = () => {
  // }

  switchBlockStatus = async (banned) => {
    const { loginedUser, switchBlock, id, } = this.props;
    if (!loginedUser || !switchBlock) {
      message.error('请先登录');
      return;
    }
    await switchBlock({
      variables: {
        userToken: loginedUser.token,
        banid: id,
        banned,
      }
    });
  }


  render() {
    const { loginedUser, id, block, } = this.props;
    if (_.isUndefined(block)) return null;

    if (block) {
      return (
        <Button type="dashed" icon="check-circle-o"
          className="block-imagewords-item"
          onClick={async () => this.switchBlockStatus(false)}>
          {"您已屏蔽此看图说说，点击以取消"}
        </Button>
      );
    }

    return (
      <div className="image-words-wrap">

        <Row >
          <Col span={16}>
            <Row>
              {/* 图像+选中的文字 */}
              <OssImageWithWord id={id}
                ref={(div) => { this.divContent = div }} />
            </Row>

            <Row>
              <Col span={4}>
                {/* 图像点赞数量（是各word点赞之和） */}
                <ImageVoteCount id={id} />
              </Col>

              <Col span={4} >
                {/* 导出图像（保存为本地图像） */}
                <ExportImageButton download={this.downloadImage} id={id} />
              </Col>

              <Col span={4} >
                <Button icon="copy" onClick={this.onCopyImage}>{"复制"}</Button>

                <Modal title="右键-复制图片（建议使用谷歌Chrome或360浏览器）"
                  visible={this.state.visibleCopyModal}
                  width="700px"
                  onCancel={this.closeCopyModal}
                  footer={[
                    <Button key="back" size="large" onClick={this.closeCopyModal}>{"关闭"}</Button>,
                  ]}
                >
                  {/* 拷贝图像，用于右键复制到粘贴板 */}
                  <CopyImage id={id} />
                </Modal>
              </Col>

              <Modal title="举报：请选择理由"
                visible={this.state.visibleReport}
                width="700px"
                onCancel={this.closeReportModal}
                footer={[
                  <Button key="back" size="large" onClick={this.closeReportModal}>{"关闭"}</Button>,
                ]}
              >
                <Report imageid={id} wordid={null} afterReport={this.closeReportModal} />
              </Modal>

              {/* 更多展开菜单 */}
              <Col span={4} >
                <Dropdown.Button overlay={this.moreDropdownMenu()}>
                  {"更多"}
                </Dropdown.Button>
              </Col>
            </Row>
          </Col>

          <Col span={8}>
            <Row>
              {/* 所有说说列表 */}
              <ListWords imageid={id} />
            </Row>
            <Row>
              {
                loginedUser ?
                  (<div style={{ textAlign: "left" }}>
                    {/* 新建说说文字 */}
                    <NewWords imageid={id} />
                  </div>) :
                  null
              }
            </Row>
          </Col>
        </Row>


      </div>
    );
  }
}


export default compose(

  withLocalLoginedUserQuery(),

  withMutImageLocalField('base64Copying'),

  graphql(QUEREY_BLOCK, {
    name: `block`,
    props: ({ block: { block, } }) => ({ block, }),
    options: ({ loginedUser, id }) =>
      ({
        variables: {
          userToken: loginedUser ? loginedUser.token : null,
          banid: id,
        }
      }),
  }),

  graphql(MUT_SWITCH_BLOCK, {
    name: `switchBlock`,
    options: (props) => ({
      update: (proxy, { data: { switchBlock } }) => {
        // console.log('switchBlock');
        const { loginedUser, id } = props;
        const data = proxy.readQuery({
          query: QUEREY_BLOCK,
          variables: {
            userToken: loginedUser ? loginedUser.token : null,
            banid: id,
          }
        });
        data.block = switchBlock;
        proxy.writeQuery({
          query: QUEREY_BLOCK,
          data,
          variables: {
            userToken: loginedUser ? loginedUser.token : null,
            banid: id,
          }
        });
      },
    }),
  }),

)(ImageWords);

