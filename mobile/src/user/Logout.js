import React, { Component,PureComponent, } from 'react';
// import { connect } from 'react-redux';
import { Platform, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { compose, withApollo } from 'react-apollo';

// import { logout } from './actions';
// import { REDUCER_LOGIN } from './reducer';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { withMetadataQuery } from '../graphql/WithQuery';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { setLocalStorageLoginedUser } from './Util';
import { BUTTON_TYPE_LOGOUT, } from '../components/button';
import { ButtonCommon } from '../components/button';
import { QUERY_LOGOUT, } from '../graphql/GQLQuery';


class Logout extends PureComponent {

  submitLogout2Server = async () => {
    const { client, loginedUser, } = this.props;

    if (loginedUser) {
      const { data } = await client.query({
        query: QUERY_LOGOUT,
        variables: {
          userToken: loginedUser.token,
        },
        fetchPolicy: 'no-cache',
      });
      const { logout } = data;
      // console.log('Logout submitLogout2Server: ', logout);
    }
  }

  handleLogout = async () => {
    const { metadata, updateLoginedUser } = this.props;

    await updateLoginedUser({
      variables: {
        loginedUser: null,
      }
    });

    await this.submitLogout2Server();

    //存储到本地
    setLocalStorageLoginedUser(null, metadata);
  }

  render() {
    return (
      <View style={styles.container}>
        <ButtonCommon type={BUTTON_TYPE_LOGOUT}
          onPress={this.handleLogout}
          text={"注销"}
        />
      </View>
    );
  }
}


export default compose(
  withApollo,
  withMetadataQuery(),
  withMutLocalLoginedUser(),
  withLocalLoginedUserQuery(),
)(Logout);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'red',
  },
});

