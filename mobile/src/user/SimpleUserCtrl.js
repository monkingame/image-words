import React, { Component, PureComponent, } from 'react';
// import { connect } from 'react-redux';
import { compose, } from "react-apollo";
import { StyleSheet, View, } from 'react-native';

import UserPanel from './UserPanel';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { ExtDialog, } from '../components';

import { BUTTON_TYPE_USER, } from '../components/button';
import { ButtonCommon } from '../components/button';


// 简单的用户信息 @2018-08-07 14:48:10
class SimpleUserCtrl extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      // 对话框：登录
      visibleModalLogin: false,
      // 对话框显示的文字
      titleLoginDialog: null,
    };
  }

  onUser = () => {
    this.setState({ visibleModalLogin: true, });
  }

  handleCloseModalUser = () => {
    this.setState({ visibleModalLogin: false, titleLoginDialog: null, });
  }


  renderUI = () => {
    const { loginedUser, longTitle } = this.props;
    let text = '未登录';
    if (loginedUser) {
      const { username } = loginedUser;
      if (username) {
        text = longTitle ? username : username.substring(0, 3);
      }
    }

    return (
      <View>
        <View style={{ flex: 1 }}>
          <ButtonCommon
            type={BUTTON_TYPE_USER}
            onPress={this.onUser}
            text={text}
            status={loginedUser}
          />
        </View>

        <ExtDialog
          title={this.state.titleLoginDialog}
          visible={this.state.visibleModalLogin}
          handleClose={this.handleCloseModalUser}>
          <UserPanel />
        </ExtDialog>
      </View>
    );
  }


  render() {
    return (
      <View style={styles.container}>
        {this.renderUI()}
      </View>
    );
  }
}



export default compose(
  withLocalLoginedUserQuery(),
)(SimpleUserCtrl);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

