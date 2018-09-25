import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { Button, Row, Col, message, Modal } from 'antd';
import 'antd/dist/antd.css';
// import { Query, compose, graphql } from "react-apollo";
import { compose, } from "react-apollo";

import Refresh from './Refresh';
import { PostNew } from '../image/';
import { SearchResultListClickMore, SearchInput } from '../search/';
import ListImageWords from './ListImageWords';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { withLocalSearchStatusQuery } from '../graphql/WithQuery';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';

import './main.css';
// const Search = Input.Search;

class MainPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visiblePostNew: false,
    };
  }

  newShuoShuo = () => {
    const { loginedUser } = this.props;

    // if (!this.props.userid) {
    if (!loginedUser) {
      message.error('请先登录');
      return;
    }

    this.setState({
      visiblePostNew: true,
    });
  }

  //NOTE:此函数不能删除：PostNew上传完后，要用此关闭对话框
  onClosePostnewModal = (event, addedImage) => {
    // console.log('MainPage onClosePostnewModal: ', event, addedImage);
    this.setState({
      visiblePostNew: false,
    });

    if (addedImage) {
      const { startCounter, } = this.props.timeoutCounter;
      startCounter();
    }
  }

  render() {

    const { searchStatus } = this.props;
    // console.log('MainPage searchStatus: ', searchStatus);
    let shouldInSearch = false;
    if (searchStatus) {
      const { keyword, inSearch } = searchStatus;
      shouldInSearch = keyword && (keyword.length > 0) && inSearch;
    }
    const { counterStr, ticking, } = this.props.timeoutCounter;

    return (
      <div className="list-bkg">
        <Row className="toolbar" >
          {/* 刷新 */}
          <Col span={4}><Refresh /></Col>
          <Col span={4}>
            <Button onClick={this.newShuoShuo} disabled={ticking}>
              {`新看图说说${counterStr}`}
            </Button>
          </Col>
          {/* <Col span={4}><Button >{"最新"}</Button></Col> */}
          <Col span={8}><SearchInput /></Col>
        </Row>

        <Modal title="新看图说说"
          visible={this.state.visiblePostNew}
          width="700px"
          onCancel={this.onClosePostnewModal}
          footer={[
            <Button key="back" size="large" onClick={this.onClosePostnewModal}>{"关闭"}</Button>,
          ]}
        >
          {
            this.state.visiblePostNew ?
              <PostNew closeModal={this.onClosePostnewModal} /> :
              null
          }
        </Modal>

        <Row>
          {
            shouldInSearch ?
              <SearchResultListClickMore keyword={searchStatus.keyword} /> :
              <ListImageWords />
          }
        </Row>
      </div>
    );
  }
}


export default compose(
  // withApollo,
  withLocalLoginedUserQuery(),
  withLocalSearchStatusQuery(),
)(withTimeoutCounter(MainPage, 10));

