import React, { Component } from 'react';
import { Button, Modal, message, Menu, Dropdown, Icon, Row, Col, } from 'antd';
import 'antd/dist/antd.css';
import { graphql, compose, } from "react-apollo";
// import InfiniteScroll from 'react-infinite-scroller';

import { DeleteWords } from '../word';
import { VoteWords } from '../word';
import WordsLabel from './WordsLabel';
// import { QUERY_WORDS_BY_IMAGEID, QUERY_IMAGE, QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
// import { QUERY_IMAGE, QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
// import { withMutImageSelectedWord } from '../graphql/WithMutation';
// import { PAGI_WORDS_LIMIT } from '../util/GlobalConst';
import Report from '../main/Report';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
// import { withMutSwitchBlock } from '../graphql/WithMutation';
import { QUEREY_BLOCK, } from '../graphql/GQLQuery';
import { MUT_SWITCH_BLOCK, } from '../graphql/GQLMutation';
import './words.css';

const _ = require('lodash');


class WordPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visibleReport: false,
    };
  }

  onReport = (e, imageid, wordid, ) => {
    const { loginedUser, } = this.props;
    if (!loginedUser) {
      message.error('请先登录');
      return;
    }
    this.setState({
      visibleReport: true,
    });
    // console.log('onReport : ', imageid, wordid);
  }

  closeReportModal = () => {
    this.setState({ visibleReport: false, });
  }

  moreDropdownMenu = () => {
    // console.log('WordsList moreDropdownMenu: ', imageid, wordid);
    const { imageid, word } = this.props;

    return (
      <Menu
      // onClick={() => this.handleMoreMenuClick(imageid, wordid)}
      >
        {/* 删除 */}
        <Menu.Item key="1">
          <DeleteWords imageid={imageid} id={word.id} />
        </Menu.Item>

        {/* 举报 */}
        <Menu.Item key="2">
          <Button icon="notification" size="small" onClick={this.onReport} />
        </Menu.Item>

        {/* 屏蔽 */}
        <Menu.Item key="3">
          {/* <Button icon="close-circle-o" size="small" onClick={this.onClickBlock} /> */}
          <Button icon="close-circle-o" size="small"
            onClick={async () => this.switchBlockStatus(true)} />
          {/* <Icon type="close-circle-o" /> */}
        </Menu.Item>
      </Menu>
    )
  };

  // onClickBlock = async () => {
  //   const { loginedUser, switchBlock, word, } = this.props;
  //   if (!loginedUser || !switchBlock) {
  //     message.error('请先登录');
  //     return;
  //   }

  //   // const block =
  //   await switchBlock({
  //     variables: {
  //       userToken: loginedUser.token,
  //       banid: word.id,
  //       banned: true,
  //     }
  //   });
  //   // console.log('WordsList onClickBlock: ', block);
  // }

  // handleMoreMenuClick = (e, imageid, wordid) => {
  //   // message.info('Click on menu item.');
  //   console.log('WordsList moreDropdownMenu: ', e, imageid, wordid);
  // }

  switchBlockStatus = async (banned) => {
    const { loginedUser, switchBlock, word, } = this.props;
    if (!loginedUser || !switchBlock) {
      message.error('请先登录');
      return;
    }
    await switchBlock({
      variables: {
        userToken: loginedUser.token,
        banid: word.id,
        banned,
      }
    });
  }


  render() {
    // const { imageid, moreWordsByImageId } = this.props;
    // if (!moreWordsByImageId) return null;

    const { imageid, word } = this.props;
    if (!word) return null;

    const { block } = this.props;
    if (!_.isUndefined(block)) {
      // console.log('WordPanel block : ', block, word.content);
      if (block) {
        return (
          // <div className="block-words-item">
          <Button type="dashed" icon="check-circle-o" className="block-words-item"
            onClick={async () => this.switchBlockStatus(false)}>
            {"点击取消屏蔽"}
          </Button>
          // </div>
        );
      }
    }

    return (
      <div className="words-panel">
        {/* TODO:如果Modal放在这里 将会出现背景黑色的情况 应该是List.Item缘故 */}

        <Row>
          <Col span={15}>
            <WordsLabel imageid={imageid} id={word.id} content={word.content} />
          </Col>

          <Col span={5}>
            <VoteWords imageid={imageid} id={word.id} />
          </Col>

          <Col span={2}>
            <Dropdown overlay={this.moreDropdownMenu()}>
              <Button size="small">
                <Icon type="ellipsis" />
              </Button>
            </Dropdown>
          </Col>
        </Row>

        {/* <Modal title="举报：请选择理由" */}
        <Modal title={`举报： ${word.content}`}
          visible={this.state.visibleReport}
          width="700px"
          onCancel={this.closeReportModal}
          footer={[
            <Button key="back" size="large" onClick={this.closeReportModal}>{"关闭"}</Button>,
          ]}
        >
          <Report
            imageid={imageid} wordid={word.id}
            afterReport={this.closeReportModal} />
        </Modal>

      </div>
    );
  }

}


export default compose(
  // withApollo,
  withLocalLoginedUserQuery(),

  // withMutSwitchBlock(),

  graphql(QUEREY_BLOCK, {
    name: `block`,
    props: ({ block: { block, } }) => ({ block, }),
    options: ({ loginedUser, word }) =>
      ({
        variables: {
          userToken: loginedUser ? loginedUser.token : null,
          banid: word.id,
        }
      }),
  }),

  graphql(MUT_SWITCH_BLOCK, {
    name: `switchBlock`,
    options: (props) => ({
      update: (proxy, { data: { switchBlock } }) => {
        const { loginedUser, word } = props;
        const data = proxy.readQuery({
          query: QUEREY_BLOCK,
          variables: {
            userToken: loginedUser ? loginedUser.token : null,
            banid: word.id,
          }
        });
        // data.moreWordsByImageId.unshift(addWord);
        data.block = switchBlock;
        proxy.writeQuery({
          query: QUEREY_BLOCK,
          data,
          variables: {
            userToken: loginedUser ? loginedUser.token : null,
            banid: word.id,
          }
        });
      },
    }),
  }),
  
)(WordPanel);
