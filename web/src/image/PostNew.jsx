import React, { Component } from 'react';

import { Button, Row, Col, message, Form, Input, Spin } from 'antd';
// import { Query, } from "react-apollo";
import { compose, graphql } from "react-apollo";
import 'antd/dist/antd.css';

import './postnew.css';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
// import { QUERY_LOCAL_LOGINED_USER, } from '../graphql/GQLLocal';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { MUT_ADD_IMAGE, } from '../graphql/GQLMutation';
import { genMd5Name } from '../util/BufferBase64';
// import { QUERY_LIST_IMAGES } from '../graphql/GQLQuery';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';


const FormItem = Form.Item;
//文件大小限制 取多大合适？
const MEGA_NUMBER = 1024 * 1024;
const MAX_IMAGE_SIZE_INMEGA = 5;


class PostNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 文件信息，包括size filename等
      fileinfo: null,
      // 图像base64编码
      base64: '',
      // 说说文字
      content: '',
      // 正在保存标志
      saving: false,
    };
  }

  handleSubmit = async (e) => {
    // console.log('PostNew handleSubmit: ', e);

    e.preventDefault();
    if (!this.checkInputData()) return;

    const { fileinfo, base64, content } = this.state;
    const { loginedUser, addImage, closeModal } = this.props;

    const newImageData = {
      userToken: loginedUser.token,
      filename: genMd5Name(fileinfo.name, base64),
      base64,
      content,
    };

    this.setState({ saving: true });
    const mut = await addImage({ variables: { newImageData } });
    this.setState({ saving: false });
    // console.log('Post new image finished: ', result);
    const result = mut.data.addImage;
    // console.log('PostNew image finished: ', result);
    // if (result) {
    closeModal(e, result);
    // }
  }


  clearAllData = () => {
    this.setState({
      fileinfo: null, base64: '', content: '',
      // saving: false,//TODO:这里不应该把saving设置为false，如果还在往服务器发送，不应当终止
    });
  }

  checkInputData = () => {
    const { fileinfo, base64, content } = this.state;
    const { loginedUser, } = this.props;

    if (!loginedUser) {
      message.error(`未登录不能发表说说`);
      return false;
    }
    if (!base64 || !fileinfo) {
      message.error("请选择图片");
      return false;
    }
    if (fileinfo.size <= 0) {
      message.error(`不允许空文件`);
      return false;
    }
    if (!content || content.length <= 0) {
      message.error("请输入说说文字");
      return false;
    }
    if (fileinfo.size >= MAX_IMAGE_SIZE_INMEGA * MEGA_NUMBER) {
      message.error(`文件尺寸不能大于${MAX_IMAGE_SIZE_INMEGA}M`);
      return false;
    }
    if (content.length > WORDS_MAX_LENGTH) {
      message.error(`说说长度不能超过${WORDS_MAX_LENGTH}字符`);
      return false;
    }

    return true;
  }

  handleImageChange = (e) => {
    this.setState({ fileinfo: null, base64: '' });
    const fileinfo = e.target.files[0];
    if (!fileinfo) {
      return;
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      this.setState({
        fileinfo,
        base64: reader.result
      });
    }
    reader.readAsDataURL(fileinfo);
  }

  render() {
    const { loginedUser } = this.props;
    if (!loginedUser) return null;
    const { fileinfo } = this.state;

    let preview = null;
    const { base64 } = this.state;
    if (base64) {
      preview = (
        <div className="img-wrap">
          <img src={base64} alt={fileinfo ? fileinfo.name : '新图像上传'} className="img-self" />
        </div>
      );
    }


    return (
      <div>
        <Form onSubmit={this.handleSubmit}>

          <Row>
            {preview}
          </Row>

          <Row>
            <FormItem>
              <Col span={4}>
                <div className="upload-btn-wrapper">
                  <Button icon="upload">{"选择图片"}</Button>
                  <Input name="fileupload" type="file"
                    // value={this.state.dispfilename}
                    onChange={this.handleImageChange} />
                </div>
              </Col>
              <Col span={6}>{`文件尺寸不能大于${MAX_IMAGE_SIZE_INMEGA}M`}</Col>
              <Col span={14}>{fileinfo ? fileinfo.name : null}</Col>

            </FormItem>
          </Row>


          <Row>
            <FormItem>
              <Input name="content" type="text"
                maxLength={WORDS_MAX_LENGTH.toString()}
                value={this.state.content} onChange={(e) => { this.setState({ content: e.target.value }) }}
                placeholder={`配句说说(不能超过${WORDS_MAX_LENGTH}字符)`} />
            </FormItem>
          </Row>

          <Row style={{ textAlign: "center" }}>
            <Col span={6} offset={6}>
              <FormItem>
                {/* <Button onClick={this.handleClear}>{"清除"}</Button> */}
                <Button onClick={() => { this.clearAllData() }}>{"清除"}</Button>
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem>
                <Spin spinning={this.state.saving}>
                  <Button type="primary" htmlType="submit" disabled={this.state.saving}>
                    {"发表说说"}
                  </Button>
                </Spin>
              </FormItem>
            </Col>
          </Row>
        </Form>


      </div >
    );
  }
}


export default compose(
  // graphql(QUERY_LOCAL_LOGINED_USER, {
  //   name: `queryUser`,
  //   props: ({ queryUser: { loginedUser } }) => ({ loginedUser }),
  // }),
  withLocalLoginedUserQuery(),
  graphql(MUT_ADD_IMAGE, {
    name: `addImage`,
    options: {
      update: (proxy, { data: { addImage } }) => {
        // const data = proxy.readQuery({ query: QUERY_LIST_IMAGES });
        // data.images.unshift(addImage);//or push item to the end
        // proxy.writeQuery({ query: QUERY_LIST_IMAGES, data });
        // // console.log('PostNew MUT_ADD_IMAGE: ', proxy, addImage);

        if (!addImage) return;

        const data = proxy.readQuery({ query: QUERY_MORE_IMAGES });
        data.moreImages.unshift(addImage);//or push item to the end
        proxy.writeQuery({ query: QUERY_MORE_IMAGES, data });
      },
    }
  }),
)(PostNew);

