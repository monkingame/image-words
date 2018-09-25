import React, { Component } from 'react';
import { graphql, compose, } from "react-apollo";
import { View, Alert, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';

import DeleteWords from './DeleteWords';
import VoteWords from './VoteWords';
import WordLabel from './WordLabel';
import Report from '../main/Report';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { QUEREY_BLOCK, } from '../graphql/GQLQuery';
import { MUT_SWITCH_BLOCK, } from '../graphql/GQLMutation';
import { ButtonCommon, } from '../components/button';
import { BUTTON_TYPE_BLOCK, BUTTON_TYPE_REPORT, BUTTON_TYPE_MORE, } from '../components/button';
import { TransDialog, } from '../components';

const _ = require('lodash');


class WordPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visibleReport: false,
      visibleMoreCtrl: false,
    };
  }

  onReport = () => {
    const { loginedUser, } = this.props;
    if (!loginedUser) {
      Alert.alert('请先登录');
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

  switchBlockStatus = async (banned) => {
    const { loginedUser, switchBlock, word, } = this.props;
    if (!loginedUser || !switchBlock) {
      Alert.alert('请先登录');
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

  handleSwitchMoreCtrl = () => {
    this.setState({ visibleMoreCtrl: !this.state.visibleMoreCtrl, });
  }


  render() {
    // simpleShow 是从props传递来的 指示是否显示更多按钮 主要是用来简单显示的
    const { imageid, word, metadata, simpleShow, } = this.props;
    if (!word) return null;

    const { block } = this.props;
    if (!_.isUndefined(block)) {
      // console.log('WordPanel block : ', block, word.content);
      if (block) {
        return (
          <View style={styles.blockContainer} >
            <ButtonCommon type={BUTTON_TYPE_BLOCK}
              onPress={async () => this.switchBlockStatus(false)}
              text={"您已屏蔽此看图说说，点击以取消"} />
          </View>
        );
      }
    }

    const { visibleMoreCtrl } = this.state;

    return (
      <View style={styles.container}>

        <View
          // style={styles.listItem}
          style={styles.ctrlBarCommon}
          // style={visibleMoreCtrl ? styles.ctrlBarNoBottom : styles.ctrlBar}
          key={word.id}>
          <View style={{ flex: 3, marginLeft: 10, }}>
            <WordLabel imageid={imageid} id={word.id} content={word.content} metadata={metadata} />
          </View>

          <View style={{ flex: 1, }}>
            <VoteWords imageid={imageid} id={word.id} />
          </View>

          {simpleShow ?
            null :
            <View style={{ flex: 1, }}>
              <ButtonCommon type={BUTTON_TYPE_MORE} onPress={this.handleSwitchMoreCtrl} status={visibleMoreCtrl} />
            </View>
          }

        </View>

        {
          visibleMoreCtrl ?
            (<View
              // style={styles.assitBar}
              style={styles.ctrlBarCommon}
            >
              <View style={{ flex: 1, }}>
                <DeleteWords imageid={imageid} id={word.id} />
              </View>

              <View style={{ flex: 1, }}>
                <ButtonCommon type={BUTTON_TYPE_BLOCK}
                  onPress={async () => this.switchBlockStatus(true)} />
              </View>

              <View style={{ flex: 1, }}>
                <ButtonCommon type={BUTTON_TYPE_REPORT}
                  onPress={this.onReport} />
              </View>

            </View>) :
            null
        }

        <TransDialog scaleContent={5 / 6}
          visible={this.state.visibleReport} handleClose={this.closeReportModal}>
          <Report imageid={imageid} wordid={word.id} afterReport={this.closeReportModal} />
        </TransDialog>

      </View>
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


const styles = StyleSheet.create({
  // wordsContainer: {
  //   flex: 5,
  //   // backgroundColor: '#ddeeff',
  // },
  // scrollContainer: {
  //   flex: 1,
  // },
  // commandsContainer: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  container: {
    flex: 1,
    // flexDirection: 'column',
    justifyContent: 'center',
    borderColor: '#AABB33',
    borderRadius: 3,
    borderWidth: 0,
    // borderBottomWidth: 1,
    // marginBottom: 3,
    // marginTop: 3,
    // margin: 3,
    marginHorizontal: 3,
    marginVertical: 5,
    // borderRightColor: 'green',
    // backgroundColor: 'yellow',
  },
  // 通用：取代ctrlBar/ctrlBarNoBottom/assitBar，因为这3个styles似乎没用了
  ctrlBarCommon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  ctrlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginHorizontal: 40,
    // marginVertical: 10,
    // borderBottomWidth: 1,
    // borderColor: '#AAAADC',
    // height: 100,
  },
  ctrlBarNoBottom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginHorizontal: 40,
    // marginVertical: 10,
    // borderBottomWidth: 0,
    // borderColor: '#AAAADC',
    // height: 100,
  },
  assitBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    // marginHorizontal: 40,
    // marginVertical: 10,
    // borderTopWidth: 0,
    // borderBottomWidth: 1,
    // borderColor: '#AAAADC',
    // height: 100,
  },
})
