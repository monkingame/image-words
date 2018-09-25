import React, { Component, PureComponent, } from 'react';
// import { connect } from 'react-redux';
import { compose, } from "react-apollo";
import { StyleSheet, View, } from 'react-native';

import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import UserInfo from './UserInfo';

import { getDimensionHeight, } from '../util/DimesionUtil';
import { HEIGHT_BOTTOM_TAB_BAR } from '../util/DimesionUtil';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';

import { BUTTON_TYPE_LOGIN, BUTTON_TYPE_REGISTER, } from '../components/button';
import { ButtonCommon } from '../components/button';


//包括所有的用户登录、注册、信息等界面
class UserPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { showSwitch: true };
  }

  renderUI = () => {
    const { loginedUser } = this.props;
    if (loginedUser) return this.renderExistUser();

    if (this.state.showSwitch) {
      return this.renderUILogin();
    } else {
      return this.renderUIRegister();
    }
  }

  renderExistUser = () => {
    return (
      <View style={styles.container}>
        <View style={styles.existUserInfo}>
          <UserInfo />
        </View>

        <View style={styles.existUserLogout}>
          <Logout />
        </View>
      </View>
    );
  }

  renderUILogin = () => {
    return (
      <View style={styles.container}>
        <View style={styles.loginLogin}>
          <Login />
        </View>
        <View style={styles.loginButtonRegister}>
          <ButtonCommon type={BUTTON_TYPE_REGISTER}
            onPress={() => { this.setState({ showSwitch: false }); }}
            text={"没有账户？注册一个"}
          />
        </View>
      </View>
    );
  }

  renderUIRegister = () => {
    return (
      <View style={styles.container}>
        <View style={styles.regRegister}>
          <Register />
        </View>

        <View style={styles.regButtonLogin}>
          <ButtonCommon type={BUTTON_TYPE_LOGIN}
            onPress={() => { this.setState({ showSwitch: true }); }}
            text={"已有账户登录"}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View
        style={[styles.container,
          // { height: getDimensionHeight() - HEIGHT_BOTTOM_TAB_BAR, }
        ]}>
        {this.renderUI()}
      </View>
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),
)(UserPanel);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  existUserInfo: {
    flex: 5,
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
  existUserLogout: {
    flex: 1,
  },
  loginLogin: {
    flex: 5,
  },
  loginButtonRegister: {
    flex: 2,
  },
  regRegister: {
    flex: 2,
  },
  regButtonLogin: {
    flex: 1,
  },
});

