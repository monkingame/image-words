import React, { Component, PureComponent, } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, Text, } from 'react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { compose, graphql, } from "react-apollo";
// import Modal from "react-native-modal";

import { ListWords, NewWords, ListWordsSimple, } from '../word';
import { DeleteImage, ImageVoteCount, } from '../image';
import { addJpegBase64Header } from '../util/BufferBase64';
import { ButtonCommon, } from '../components/button';
import {
  BUTTON_TYPE_WORDS, BUTTON_TYPE_SHARE, BUTTON_TYPE_FAVORITE,
  BUTTON_TYPE_BLOCK, BUTTON_TYPE_REPORT,
  BUTTON_TYPE_MORE, BUTTON_TYPE_MORE_HORIZON, BUTTON_TYPE_NONE,
} from '../components/button';
import { TransDialog, ExtDialog, } from '../components';
import Report from './Report';
import ZoomImage from './ZoomImage';
import { UserPanel } from '../user';
import { getAndroidPermission } from '../util/PermissionUtil';

import { withLocalLoginedUserQuery, withImageQuery, } from '../graphql/WithQuery';
import { withMutImageLocalField } from '../graphql/WithMutation';
import { QUEREY_BLOCK, QUERY_MORE_WORDS_BY_IMAGEID, QUEREY_FAVORITE, } from '../graphql/GQLQuery';
import { MUT_SWITCH_BLOCK, MUT_SWITCH_FAVORITE, } from '../graphql/GQLMutation';
import OssImageWithWord from '../components/OssImageWithWord';
import { PAGI_WORDS_LIMIT } from '../util/GlobalConst';
// import {
//   HEIGHT_TOP_STATUS_BAR, HEIGHT_TOP_CTRL_BAR, HEIGHT_BOTTOM_TAB_BAR,
//   WIDTH_CHILD, HEIGHT_CHILD, MARGIN_CHILD, LEFT_CHILD, TOP_CHILD,
//   HEIGHT_WORD_LABEL,
// } from '../util/DimesionUtil';
// import { genRandomColor } from './Util';
import styles from './ImageWordsStyle';

const _ = require('lodash');


class ImageWords extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      // 对话框：说说列表
      visibleModalWords: false,
      // 对话框：举报
      visibleModalReport: false,
      // 更多按钮（如举报、删除、屏蔽等不常用功能）
      visibleMoreCtrl: false,
      // 对话框：缩放图片
      visibleModalZoomImage: false,
      // 对话框：登录
      visibleModalLogin: false,
      // 登录对话框显示的文字
      titleLoginDialog: null,
    };
  }


  componentWillReceiveProps(nextProps) {
    const { id, moreWordsByImageId, image, updateImageLocalSelectedWord, metadata } = nextProps;
    if (!moreWordsByImageId || !image || !metadata) return;
    //默认第一条说说选中
    // TODO: NOTE: 注意此处 withImageQuery是需要metadata参数的，那么这个参数是如何穿进去的？
    // 这里有隐患，最好是在父层 把metadata参数传进来 而不要自己去Query了
    const { selectedWord } = image;
    if (!selectedWord && moreWordsByImageId.length > 0) {
      updateImageLocalSelectedWord({
        variables: {
          id,
          selectedWord: moreWordsByImageId[0].content,
        }
      });
    }
  }

  // getAndroidPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const allowedStorage =
  //       await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  //       );
  //     return allowedStorage === PermissionsAndroid.RESULTS.GRANTED;
  //   }

  //   return true;
  // }


  getViewShotBase64 = async () => {
    const uri = await this.refs.viewShot.capture();
    const puredata = await RNFS.readFile(uri, 'base64');
    const base64 = addJpegBase64Header(puredata);

    const { updateImageLocalBase64Copying, id, } = this.props;
    updateImageLocalBase64Copying({
      variables: {
        id,
        base64Copying: base64,
      }
    });

    return base64;
  }

  rnShareViewShotImage = async () => {
    const { image } = this.props;
    if (!image) return;
    // const { selectedWord } = image;
    const base64 = await this.getViewShotBase64();
    const shareFile = {
      url: base64,
    };
    Share.open(shareFile);
  }

  onShareImageWithWords = async () => {
    // if (!this.getAndroidPermission()) return;
    if (!getAndroidPermission()) return;
    await this.rnShareViewShotImage();
  }


  handleCloseModalWords = () => {
    this.setState({ visibleModalWords: false, });
  }

  // onFavorite = () => {
  //   const { loginedUser, } = this.props;
  //   if (!loginedUser) {
  //     // Alert.alert('请先登录再收藏', );
  //     this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录再收藏', });
  //     return;
  //   }
  //   console.log('ImageWords onFavorite...');
  // }

  handleCloseModalFavorite = () => {
    this.setState({ visibleModalLogin: false, titleLoginDialog: null, });
  }

  onReport = () => {
    const { loginedUser, } = this.props;
    if (!loginedUser) {
      // Alert.alert('请先登录再举报', );
      this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录再举报', });
      return;
    }
    this.setState({ visibleModalReport: true, });
  }

  handleCloseModalReport = () => {
    this.setState({ visibleModalReport: false, titleLoginDialog: null, });
  }

  switchBlockStatus = async (banned) => {
    const { loginedUser, switchBlock, id, } = this.props;
    if (!loginedUser || !switchBlock) {
      // Alert.alert('请先登录再屏蔽', );
      this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录再屏蔽', });
      return;
    }
    this.setState({ titleLoginDialog: null, });

    await switchBlock({
      variables: {
        userToken: loginedUser.token,
        banid: id,
        banned,
      }
    });
  }

  switchFavoriteStatus = async (favorited) => {
    const { loginedUser, switchFavorite, id, image, } = this.props;
    if (!loginedUser || !switchFavorite) {
      this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录再收藏', });
      return;
    }
    if (!image) return;

    this.setState({ titleLoginDialog: null, });

    await switchFavorite({
      variables: {
        userToken: loginedUser.token,
        imageid: id,
        favorited,
        word: image.selectedWord,
      }
    });
  }

  handleSwitchMoreCtrl = () => {
    this.setState({ visibleMoreCtrl: !this.state.visibleMoreCtrl, });
  }

  onImagePress = async () => {
    await this.getViewShotBase64();
    this.setState({ visibleModalZoomImage: true });
  }

  handleCloseModelZoomImage = () => {
    this.setState({ visibleModalZoomImage: false });
  }

  isMyImage = (loginedUser, image) => {
    if (!loginedUser) return false;
    if (!image) return false;
    if (!loginedUser.id || !image.authorid) return false;
    return (loginedUser.id === image.authorid);
  }

  render() {
    // 注意： metadata已经通过父层传递过来（即在props里面了）
    const { loginedUser, id, metadata, block, image, favorite, } = this.props;
    if (!metadata || _.isUndefined(block)) return null;

    // console.log('ImageWords render image: ', image);
    // console.log('ImageWords render loginedUser: ', loginedUser);

    if (block) {
      return (
        <View style={[styles.container, { backgroundColor: '#BBBBBB', }]} >
          <ButtonCommon type={BUTTON_TYPE_BLOCK}
            onPress={async () => this.switchBlockStatus(false)}
            text={"您已屏蔽此看图说说，按此取消"} />
        </View>
      );
    }

    const { visibleMoreCtrl } = this.state;

    return (
      <View style={[styles.container,
        // { backgroundColor: genRandomColor(), },
      ]}>
        <TouchableOpacity
          onPress={this.onImagePress}
          activeOpacity={0.85}
          style={styles.imageWithLabel}>
          <ViewShot
            style={styles.viewShot}
            ref="viewShot"
            options={{
              format: "jpg",
            }}>
            <OssImageWithWord id={id} />
          </ViewShot>
        </TouchableOpacity>

        <View style={styles.ctrlBar} >
          <View style={styles.ctrlFunctionBar}>
            <View style={styles.buttonContainer} >
              <ImageVoteCount id={id} metadata={metadata} />
            </View>

            <View style={styles.buttonContainer} >
              <ButtonCommon type={BUTTON_TYPE_SHARE} onPress={this.onShareImageWithWords} />
            </View>

            {/* <View style={styles.buttonContainer} >
              <ButtonCommon type={BUTTON_TYPE_WORDS} onPress={() => this.setState({ visibleModalWords: true, })} />
            </View> */}

            <View style={styles.buttonContainer} >
              <ButtonCommon
                type={BUTTON_TYPE_FAVORITE}
                color={loginedUser ?
                  (favorite ? 'red' : 'black') :
                  'gray'}
                status={favorite}
                onPress={() => this.switchFavoriteStatus(!favorite)}
              />
            </View>

            {visibleMoreCtrl ?
              <View style={styles.buttonContainer} >
                <ButtonCommon type={BUTTON_TYPE_BLOCK}
                  color={loginedUser ? 'black' : 'gray'}
                  onPress={async () => this.switchBlockStatus(true)}
                />
              </View>
              : null}

            {visibleMoreCtrl ?
              <View style={styles.buttonContainer} >
                <ButtonCommon type={BUTTON_TYPE_REPORT} onPress={this.onReport}
                  color={loginedUser ? 'black' : 'gray'}
                />
              </View>
              : null}

            {this.isMyImage(loginedUser, image) && visibleMoreCtrl ?
              <View style={styles.buttonContainer} >
                <DeleteImage id={id} metadata={metadata} />
              </View>
              : null}

            {/* <View style={styles.buttonContainer} >
              <ButtonCommon type={BUTTON_TYPE_MORE}
                onPress={this.handleSwitchMoreCtrl} status={visibleMoreCtrl} />
            </View> */}
          </View>

          <View style={styles.ctrlMoreBar}>
            <View style={styles.buttonContainer} >
              <ButtonCommon type={BUTTON_TYPE_MORE_HORIZON}
                onPress={this.handleSwitchMoreCtrl} status={visibleMoreCtrl} />
            </View>
          </View>

        </View>


        <ExtDialog
          title={this.state.titleLoginDialog}
          visible={this.state.visibleModalLogin}
          handleClose={this.handleCloseModalFavorite}>
          <UserPanel />
        </ExtDialog>


        <TransDialog scaleContent={0.9}
          // handleClose={() => this.setState({ visibleModalWords: false, })}
          handleClose={this.handleCloseModalWords}
          visible={this.state.visibleModalWords}>
          <ListWords imageid={id} metadata={metadata} />
        </TransDialog>

        <TransDialog scaleContent={5 / 6}
          visible={this.state.visibleModalReport} handleClose={this.handleCloseModalReport}>
          <Report imageid={id} wordid={null} afterReport={this.handleCloseModalReport} />
        </TransDialog>

        <TransDialog scaleContent={9 / 10}
          transBkgndColor={'#6A6A6AAA'}
          visible={this.state.visibleModalZoomImage} handleClose={this.handleCloseModelZoomImage}>
          <ZoomImage id={id} metadata={metadata} />
        </TransDialog>

        {/* <View style={styles.simpleListWords}>
          <ListWordsSimple imageid={id} metadata={metadata} />
        </View> */}

        <View style={styles.buttonFullListWords}>
          <ButtonCommon type={BUTTON_TYPE_WORDS}
            onPress={() => this.setState({ visibleModalWords: true, })}
            text={'查看说说列表'}
          />
        </View>

        <View style={styles.newWord}>
          {loginedUser ?
            <NewWords imageid={id} metadata={metadata} />
            : <ButtonCommon type={BUTTON_TYPE_NONE}
              onPress={() => {
                this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录', });
              }}
              color={'gray'}
              text={'登录后才能发表说说'}
            />
          }
        </View>


      </View >
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),
  withMutImageLocalField('base64Copying'),

  // 默认选择第一条
  withImageQuery(),
  withMutImageLocalField('selectedWord'),
  graphql(QUERY_MORE_WORDS_BY_IMAGEID, {
    name: `moreWordsByImageId`,
    props: ({ moreWordsByImageId: { moreWordsByImageId, error, loading, } }) =>
      ({ moreWordsByImageId, error, loading, }),
    options: ({ id }) => ({ variables: { imageid: id, offset: 0, limit: PAGI_WORDS_LIMIT } }),
  }),

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

  graphql(QUEREY_FAVORITE, {
    name: `favorite`,
    props: ({ favorite: { favorite, } }) => ({ favorite, }),
    options: ({ loginedUser, id }) =>
      ({
        variables: {
          // $userToken: String! 因此未登录时 参数为'' 而不是null
          userToken: loginedUser ? loginedUser.token : '',
          imageid: id,
        }
      }),
  }),


  graphql(MUT_SWITCH_FAVORITE, {
    name: `switchFavorite`,
    options: (props) => ({
      update: (proxy, { data: { switchFavorite } }) => {
        const { loginedUser, id } = props;
        const data = proxy.readQuery({
          query: QUEREY_FAVORITE,
          variables: {
            userToken: loginedUser ? loginedUser.token : '',
            imageid: id,
          }
        });
        data.favorite = switchFavorite;
        proxy.writeQuery({
          query: QUEREY_FAVORITE,
          data,
          variables: {
            userToken: loginedUser ? loginedUser.token : '',
            imageid: id,
          }
        });
      },
    }),
  }),

)(ImageWords);

