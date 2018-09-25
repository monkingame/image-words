import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, FlatList, Button, Alert, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { compose, } from "react-apollo";

import Refresh from './Refresh';
// import { inSearchStatus } from '../status/Util';
// import PostNew from '../postnew/PostNewContainer';
import { PostNew } from '../image/';
import SearchInput from '../search/SearchInput';
import { SearchResultList } from '../search';
// @2018-07-24 09:25:47 改换为新版
// import ListImageWords from './ListImageWords';
import ListImageWords from './ListImageWords';
import { BUTTON_TYPE_CLOSE, BUTTON_TYPE_ADD, } from '../components/button';
import { ButtonCommon } from '../components/button';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { withLocalSearchStatusQuery } from '../graphql/WithQuery';
import { withMetadataQuery, } from '../graphql/WithQuery';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
import { SimpleUserCtrl } from '../user';
import { ExtDialog, } from '../components';
import { UserPanel } from '../user';
import {
  getDimensionWidth, getDimensionHeight,
  HEIGHT_TOP_STATUS_BAR, HEIGHT_TOP_CTRL_BAR, HEIGHT_BOTTOM_TAB_BAR,
  WIDTH_CHILD, HEIGHT_CHILD, MARGIN_CHILD, LEFT_CHILD, TOP_CHILD,
} from '../util/DimesionUtil';

//TODO:FIX this component
class MainPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // 新看图说说对话框
      visiblePostNew: false,
      // 对话框：登录
      visibleModalLogin: false,
      // 登录对话框显示的文字
      titleLoginDialog: null,
    };
  }

  newShuoShuo = () => {
    const { loginedUser } = this.props;
    if (!loginedUser) {
      // Alert.alert('请先登录');
      this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录', });
      return;
    }

    this.setState({
      visiblePostNew: true,
    });
  }

  handleCloseModalLogin = () => {
    this.setState({ visibleModalLogin: false, titleLoginDialog: null, });
  }


  //NOTE:此函数不能删除：PostNew上传完后，要用此关闭对话框
  onClosePostnewModal = (addedImage) => {
    this.setState({
      visiblePostNew: false,
    });

    if (addedImage) {
      const { startCounter, } = this.props.timeoutCounter;
      startCounter();
    }
  }

  render() {
    const { metadata, searchStatus } = this.props;
    if (!metadata) return null;

    let shouldInSearch = false;
    if (searchStatus) {
      const { keyword, inSearch } = searchStatus;
      shouldInSearch = keyword && (keyword.length > 0) && inSearch;
    }
    const { counterStr, ticking, } = this.props.timeoutCounter;
    // console.log(`MainPage searchStatus: `, !!shouldInSearch);

    return (
      <View style={styles.container}>
        <View style={styles.topCtrlBar}>
          {/* TODO: @2018-07-26 17:05:50 去掉刷新按钮 因为下拉可以刷新了 */}
          {/* <View style={{ flex: 1, }}>
            <Refresh />
          </View> */}
          <View style={{ flex: 4, backgroundColor: '#E6F0E6' }}>
            <ButtonCommon type={BUTTON_TYPE_ADD}
              onPress={this.newShuoShuo}
              size={24}
              text={"新图说"}
            />
          </View>

          <View style={{ flex: 6, }}>
            {/* 关闭搜索 代替以用户信息 */}
            {/* <SearchInput /> */}
            <SimpleUserCtrl />
          </View>
        </View>

        <View style={styles.content}>
          {
            shouldInSearch ?
              <SearchResultList keyword={searchStatus.keyword} /> :
              <ListImageWords
                metadata={metadata}
              />
          }
        </View>

        {/* 新的看图说说 */}
        <Modal
          transparent={true}
          visible={this.state.visiblePostNew}
          animationType={'slide'}
          onRequestClose={() => this.onClosePostnewModal()}
        >
          <View style={{ flex: 1, marginTop: HEIGHT_TOP_STATUS_BAR }}>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
              }}
              activeOpacity={1}
              onPressOut={this.onClosePostnewModal}
            >
              <View style={styles.modalContainer}>
                {
                  this.state.visiblePostNew ?
                    <PostNew closeModal={this.onClosePostnewModal} /> :
                    null
                }
                <View style={{ height: 40, }}>
                  <ButtonCommon type={BUTTON_TYPE_CLOSE} onPress={this.onClosePostnewModal} text='关闭' />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* 登录对话框 */}
        <ExtDialog
          title={this.state.titleLoginDialog}
          visible={this.state.visibleModalLogin}
          handleClose={this.handleCloseModalLogin}>
          <UserPanel />
        </ExtDialog>

      </View>
    );
  }
}


export default compose(
  // withApollo,
  withMetadataQuery(),

  withLocalLoginedUserQuery(),
  withLocalSearchStatusQuery(),
)(withTimeoutCounter(MainPage, 10));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // borderColor: 'red',
    // borderWidth: 1,
    height: getDimensionHeight() - HEIGHT_TOP_STATUS_BAR - HEIGHT_BOTTOM_TAB_BAR,
    width: WIDTH_CHILD,
    position: 'absolute',
  },
  topCtrlBar: {
    height: HEIGHT_TOP_CTRL_BAR,
    flexDirection: 'row',
    // borderColor: 'red',
    // borderWidth: 1,
  },
  content: {
    // paddingTop: 6,
    flex: 1,
    // borderColor: 'blue',
    // borderWidth: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'grey',
    backgroundColor: '#9d9d9dDD',
  },
  // innerContainer: {
  //   alignItems: 'center',
  // },
});

