import React, { Component, PureComponent, } from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import md5 from 'md5';
import { compose, withApollo } from 'react-apollo';

// import { loginProcessAsync, loginFailure } from './actions';
// import { REDUCER_LOGIN } from './reducer';
import { QUERY_LOGIN, } from '../graphql/GQLQuery';
import { withMetadataQuery } from '../graphql/WithQuery';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { setLocalStorageLoginedUser } from './Util';
import withFormChecker from '../hoc/HOCFormChecker';
import { BUTTON_TYPE_LOGIN, } from '../components/button';
import { ButtonCommon } from '../components/button';
import { QUERY_USER_BY_TOKEN, } from '../graphql/GQLQuery';


class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  onUsernameChange = (username) => {
    this.setState({ username });
  }

  onPasswordChange = (password) => {
    this.setState({ password });
  }

  handleLogin = async () => {
    // console.log('Login handleLogin: ', this.props);
    const { username, password } = this.state;
    const { verifyNotEmpty, setErrorMsg, } = this.props.formChecker;
    if (!verifyNotEmpty(username, `用户名不能为空`)) return;
    if (!verifyNotEmpty(password, `密码不能为空`)) return;
    // console.log('Login handleLogin: ', username, password);

    const { client, metadata, updateLoginedUser } = this.props;
    const { data } = await client.query({
      query: QUERY_LOGIN,
      variables: {
        username,
        password: md5(password),
      },
      // @2018-06-28 11:05:12
      // fetchPolicy 改为 no-cache。那么Register和ChangePassword的writeQuery(QUERY_LOGIN)应该就没用了吧？
      fetchPolicy: 'no-cache',
    });
    const { login } = data;

    // console.log('Login handleLogin login: ', login);
    // TODO: 注意这里是否有漏洞？
    // 如果登录不成功呢？是否应该清理QUERY_USER_BY_TOKEN记录？
    if (login) {
      client.writeQuery({
        query: QUERY_USER_BY_TOKEN,
        data: { userByToken: login },
        variables: { token: login.token, }
      });
    }

    await updateLoginedUser({
      variables: {
        loginedUser: login,
      }
    });

    setLocalStorageLoginedUser(login, metadata);
    if (!login) {
      // message.error(`用户名或密码输入错误`);
      setErrorMsg(`用户名或密码输入错误`);
    }

  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 3, }}>
          <Text style={{
            color: 'red',
            // flex: 1,
          }}>
            {this.props.formChecker.errmsg}
          </Text>

          <TextInput
            onChangeText={this.onUsernameChange}
            value={this.state.username}
            placeholder='用户名'
            autoCapitalize='none'
            style={styles.input}
          />
          <TextInput
            onChangeText={this.onPasswordChange}
            value={this.state.password}
            placeholder='密码'
            autoCapitalize='none'
            style={styles.input}
            secureTextEntry={true}
          />
        </View>

        <View style={{ flex: 1, marginVertical: 10, width: 150 }}>
          <ButtonCommon type={BUTTON_TYPE_LOGIN}
            onPress={this.handleLogin}
            text={"登录"}
          />
        </View>

      </View>
    );

  }
}

// export default LoginContainer;
// export default Login;
export default compose(
  withApollo,
  // graphql(QUERY_METADATA, {
  //   name: `metadata`,
  //   props: ({ metadata: { metadata } }) => ({ metadata }),
  //   options: () => ({ variables: VARIABLES_CLIENT_IDENTIFY }),
  // }),
  withMetadataQuery(),
  withMutLocalLoginedUser(),
)(withFormChecker(Login));


const styles = StyleSheet.create({
  container: {
    // TODO:由于设置了绝对高度，所以不能再flex为1，否则就填充整个页面，很难看
    // flex: 1,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'red',
  },
  input: {
    flex: 1,
    width: 200,
    // height: 30,
    marginVertical: 10,
    // borderBottomColor: '#adadad',
    // borderBottomWidth: 1,
  }
});

