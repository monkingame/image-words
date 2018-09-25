import React, { Component, PureComponent, } from 'react';
// import { connect } from 'react-redux';
import { compose, } from "react-apollo";
import { Platform, StyleSheet, Text, TextInput, View, Button } from 'react-native';

import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import ChangePassword from './ChangePassword';
import UpdatePhone from './UpdatePhone';

class UserInfo extends PureComponent {
  render() {
    const { loginedUser } = this.props;
    if (!loginedUser) return null;
    const { token } = loginedUser;
    if (!token) return null;

    // console.log('UserInfo render: ', loginedUser);

    return (
      <View style={styles.container}>
        <View style={styles.helloText}>
          <Text>
            {"你好：" + loginedUser.username}
          </Text>
        </View>

        <View style={styles.changePassword}>
          <ChangePassword />
        </View>

        <View style={styles.verifyPhone}>
          <UpdatePhone token={token} />
        </View>
      </View>
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),

)(UserInfo);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
  },
  helloText: {
    height: 40,
  },
  changePassword: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
  verifyPhone: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
});

